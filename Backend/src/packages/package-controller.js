const models = require("../../models");

async function getPackage(req, res) {
    try {
        const packages = await models.Package.findAll({
            where: { isArchived: false }, // FILTER OUT ARCHIVED!
            include: [{ model: models.Seller, attributes: ['seller_Name'] }]
        });

        const formatted = packages.map(pkg => ({
            ...pkg.toJSON(),
            seller_Name: pkg.Seller?.seller_Name || ""
        }));

        res.status(200).json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function addPackage(req, res) {
    try {
        const {
            seller_Name,
            package_Name,
            buyer_Name,
            dropOff_Date,
            package_Size,
            price,
            handling_Fee,
            payment_Status,
            payment_Method,
            package_Status
        } = req.body;

        const seller = await models.Seller.findOne({ where: { seller_Name } });
        if (!seller) return res.status(404).json({ error: "Seller not found" });

        if (package_Status && package_Status.toLowerCase() === "claimed" && 
            (!payment_Status || payment_Status.toLowerCase() !== "paid")) {
            return res.status(400).json({ 
                error: "UNPAID_PACKAGE",
                message: "New packages must be paid before they can be claimed."
            });
        }

        const newPackage = await models.Package.create({
            seller_Id: seller.id,
            package_Name,
            buyer_Name,
            dropOff_Date,
            package_Size,
            price,
            handling_Fee,
            payment_Status: "unpaid",
            payment_Method,
            package_Status,
            isArchived: false
        });

        const fullPackage = await models.Package.findByPk(newPackage.id, {
            include: [{ model: models.Seller, attributes: ['seller_Name'] }]
        });

        res.status(201).json(fullPackage);

    } catch (err) {
        console.error("ADD PACKAGE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
}

async function deletePackage(req, res) {
    try {
        const { id, permanent = false } = req.body; // Add permanent flag
        console.log(`${permanent ? 'PERMANENT DELETE' : 'ARCHIVE'} package ID:`, id);
        
        const pkg = await models.Package.findByPk(id);
        if (!pkg) return res.status(404).json({ message: "Package not found" });

        if (permanent) {
            // PERMANENT DELETE - only for archived packages
            if (!pkg.isArchived) {
                return res.status(400).json({ 
                    message: "Only archived packages can be permanently deleted. Archive it first." 
                });
            }
            
            // Deduct balance if package was paid (even for permanent delete)
            if (pkg.payment_Status.toLowerCase() === "paid") {
                const seller = await models.Seller.findByPk(pkg.seller_Id);
                if (seller) {
                    seller.balance = parseFloat(seller.balance) - parseFloat(pkg.price);
                    await seller.save();
                    console.log('Updated seller balance for permanent delete:', seller.balance);
                }
            }
            
            await pkg.destroy(); // PERMANENT DELETE
            console.log(`Package ${id} PERMANENTLY DELETED`);
            
            return res.status(200).json({ 
                message: "Package permanently deleted",
                deletedId: id 
            });
        } else {
            // ARCHIVE (existing logic)
            if (pkg.payment_Status.toLowerCase() === "paid") {
                const seller = await models.Seller.findByPk(pkg.seller_Id);
                if (seller) {
                    seller.balance = parseFloat(seller.balance) - parseFloat(pkg.price);
                    await seller.save();
                    console.log('Updated seller balance for archive:', seller.balance);
                }
            }

            pkg.isArchived = true;
            pkg.archivedAt = new Date();
            pkg.archiveReason = "manual_delete";
            
            await pkg.save();
            console.log(`Package ${id} ARCHIVED at ${pkg.archivedAt}`);

            return res.status(200).json({ 
                message: "Package archived successfully",
                archivedId: id 
            });
        }
    } catch (err) {
        console.error("DELETE/ARCHIVE PACKAGE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
}

async function updatePackage(req, res) {
    try {
        const {
            id,
            seller_Name,
            package_Name,
            buyer_Name,
            dropOff_Date,
            package_Size,
            price,
            handling_Fee,
            payment_Status,
            payment_Method,
            package_Status: newPackageStatus
        } = req.body;

        const pkg = await models.Package.findByPk(id);
        if (!pkg) return res.status(404).json({ message: "Package not found" });

        const oldStatus = pkg.payment_Status.toLowerCase();
        const oldPrice = parseFloat(pkg.price);

        if (newPackageStatus && newPackageStatus.toLowerCase() === "claimed") {
            const currentPaymentStatus = payment_Status ? payment_Status.toLowerCase() : pkg.payment_Status.toLowerCase();
            if (currentPaymentStatus !== "paid") {
                return res.status(400).json({ 
                    message: "Package cannot be claimed because payment is not completed.",
                    error: "UNPAID_PACKAGE"
                });
            }
        }

        if (seller_Name) {
            const seller = await models.Seller.findOne({ where: { seller_Name } });
            if (!seller) return res.status(404).json({ message: "Seller not found" });
            pkg.seller_Id = seller.id;
        }

        pkg.package_Name = package_Name ?? pkg.package_Name;
        pkg.buyer_Name = buyer_Name ?? pkg.buyer_Name;
        pkg.dropOff_Date = dropOff_Date ?? pkg.dropOff_Date;
        pkg.package_Size = package_Size ?? pkg.package_Size;
        pkg.price = price ?? pkg.price;
        pkg.handling_Fee = handling_Fee ?? pkg.handling_Fee;
        pkg.payment_Status = payment_Status ?? pkg.payment_Status;
        pkg.payment_Method = payment_Method ?? pkg.payment_Method;
        pkg.package_Status = newPackageStatus ?? pkg.package_Status;

        await pkg.save();

        if (payment_Status && oldStatus !== pkg.payment_Status.toLowerCase()) {
            const seller = await models.Seller.findByPk(pkg.seller_Id);
            const newPrice = parseFloat(pkg.price);

            if (oldStatus === "unpaid" && pkg.payment_Status.toLowerCase() === "paid") {
                seller.balance = parseFloat(seller.balance) + newPrice;
            } else if (oldStatus === "paid" && pkg.payment_Status.toLowerCase() === "unpaid") {
                seller.balance = parseFloat(seller.balance) - newPrice;
            }
            await seller.save();
        }

        const updated = await models.Package.findByPk(id, {
            include: [{ model: models.Seller, attributes: ['seller_Name'] }]
        });

        res.status(200).json({ message: "Package updated successfully", package: updated });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getPackageById(req, res) {
    try {
        const { id } = req.params;
        const packageData = await models.Package.findByPk(id, {
            include: [{ model: models.Seller, attributes: ['seller_Name'] }]
        });

        if (!packageData) return res.status(404).json({ error: "Not found" });
        res.status(200).json(packageData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getSellers(req, res) {
    try {
        const sellers = await models.Seller.findAll({
            attributes: ['id', 'seller_Name']
        });
        res.status(200).json(sellers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// ADD THESE MISSING FUNCTIONS:
async function getArchivedPackages(req, res) {
    try {
        const packages = await models.Package.findAll({
            where: { isArchived: true },
            include: [{ model: models.Seller, attributes: ['seller_Name'] }]
        });

        const formatted = packages.map(pkg => ({
            ...pkg.toJSON(),
            seller_Name: pkg.Seller?.seller_Name || ""
        }));

        res.status(200).json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function restorePackage(req, res) {
    try {
        const { id } = req.body;
        
        const pkg = await models.Package.findByPk(id);
        if (!pkg) return res.status(404).json({ message: "Package not found" });

        if (!pkg.isArchived) {
            return res.status(400).json({ message: "Package is not archived" });
        }

        pkg.isArchived = false;
        pkg.archivedAt = null;
        pkg.archiveReason = null;
        
        await pkg.save();

        res.status(200).json({ 
            message: "Package restored successfully",
            restoredPackage: pkg
        });
    } catch (err) {
        console.error("RESTORE PACKAGE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
}

async function cleanupOldArchives() {
    try {
        // Change this to whatever days you want (e.g., 30 days, 7 days, etc.)
        const daysToKeep = 30; // Keep archives for 30 days before permanent deletion
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        
        console.log(`[CLEANUP] Looking for archives older than: ${cutoffDate.toISOString()}`);
        
        const oldArchives = await models.Package.findAll({
            where: {
                isArchived: true,
                archivedAt: {
                    [models.Sequelize.Op.lt]: cutoffDate
                }
            }
        });

        console.log(`[CLEANUP] Found ${oldArchives.length} old archives to delete`);

        let deletedCount = 0;
        for (const archive of oldArchives) {
            try {
                // Deduct balance if package was paid
                if (archive.payment_Status && archive.payment_Status.toLowerCase() === "paid") {
                    const seller = await models.Seller.findByPk(archive.seller_Id);
                    if (seller) {
                        // Make sure we don't go below 0
                        const newBalance = Math.max(0, parseFloat(seller.balance) - parseFloat(archive.price));
                        seller.balance = newBalance;
                        await seller.save();
                        console.log(`[CLEANUP] Updated seller ${seller.id} balance to ${newBalance}`);
                    }
                }
                
                // PERMANENT DELETE
                await archive.destroy();
                deletedCount++;
                console.log(`[CLEANUP] Permanently deleted archived package ID: ${archive.id}`);
                
            } catch (archiveError) {
                console.error(`[CLEANUP] Error deleting package ${archive.id}:`, archiveError);
                // Continue with other packages even if one fails
            }
        }

        console.log(`[CLEANUP] Successfully deleted ${deletedCount} old archived packages`);
        return deletedCount;
        
    } catch (err) {
        console.error("[CLEANUP] CLEANUP ARCHIVES ERROR:", err);
        return 0;
    }
}

module.exports = {
    getPackage,
    addPackage,
    deletePackage,
    updatePackage,
    getPackageById,
    getSellers,
    getArchivedPackages,
    restorePackage,
    cleanupOldArchives
};