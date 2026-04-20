const models = require("../../models");
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const {Op} = require('sequelize');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads', 'qrcodes')
function generateProductId() {
  const min = 1_000_000; // smallest 7-digit number
  const max = 9_999_999; // largest 7-digit number
  const id = Math.floor(Math.random() * (max - min + 1)) + min;
  return id.toString();
}
//implement thhis
function validateProduct(payload) {
  const newErrors = {};

  // Expiry
  const today = new Date();
  const expiry = new Date(payload.product_Expiry);
  const diff = (expiry - today) / (1000 * 60 * 60 * 24);

  if (expiry < today) {
    newErrors.product_Expiry = "Product is Expired.";
  } else if (diff <= 5) {
    newErrors.product_Expiry = "Expiry must be more than 5 days from today.";
  }

  // Retail price
  if (!payload.product_RetailPrice || payload.product_RetailPrice <= 0) {
    newErrors.product_RetailPrice = "Retail price must be greater than 0.";
  }

  // Buying price
  if (!payload.product_BuyingPrice || payload.product_BuyingPrice <= 0) {
    newErrors.product_BuyingPrice = "Buying price must be greater than 0.";
  }

  // Retail price must be higher than buying price
  if (payload.product_RetailPrice <= payload.product_BuyingPrice) {
    newErrors.product_RetailPrice = "Retail price must be higher than buying price.";
    newErrors.product_BuyingPrice = "Buying price must be lower than retail price.";
  }

  // Stock
  if (!payload.product_Stock || payload.product_Stock <= 0) {
    newErrors.product_Stock = "Stock must be greater than 0.";
  }

  // Name
  if (!payload.product_Name.trim()) {
    newErrors.product_Name = "Product name is required.";
  }

  // Description
  if (!payload.product_Description.trim()) {
    newErrors.product_Description = "Description is required.";
  }

  // Category
  if (!payload.product_Category.trim()) {
    newErrors.product_Category = "Category is required.";
  }

  return newErrors;
}


async function getProducts(req, res) {
 
  try {
    console.log("message:" + req.session.user +" "+ req.session.userID);
    let {page,limit} = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 7;

    const offset = (page - 1) * limit;
    const {count, rows} = await models["Products"].findAndCountAll({
      limit,
      offset,
      where:{isArchived: false},
      order: [['product_Name', 'ASC']],
    })
    res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count/limit),
      currentPage: page,
      products: rows,
    })
  } catch (err) {
    
    res.status(500).json({ error: err.message });
  }
}
async function archivedProducts(req,res){
  try {
    let {page,limit} = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 7;

    const offset = (page - 1) * limit;
    const {count, rows} = await models["Products"].findAndCountAll({
      limit,
      offset,
      where:{isArchived: true},
      order: [['product_Name', 'ASC']],
    })
    res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count/limit),
      currentPage: page,
      products: rows,
    })
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
async function archiveAddBack(req,res){
  try{
    const {id} = req.body;
    const adminEmail = req.session.user;
    const adminId = req.session.userID;
    if(!id){
      return res.status(400).json({message:"Product ID is required."})
    }
    const product = await models['Products'].findByPk(id);

    if(!product){
      return res.status(404).json({message:"Product not found"})
    }
    if (adminId) {
        await models.AdminLogActivity.create({
            adminId: adminId,
            action: 'UNARCHIVED',
            actionDetails: `Restored product from archive: ${product.product_Name}`,
            productId: id,
            timestamp: new Date()
        });
        console.log(`✅ Admin ${adminEmail} restored product: ${product.product_Name}`);
    }
    product.isArchived = false;
    await product.save();
    return res.status(200).json({message:"Product added successfully."});
  }
  catch(err){
    console.error("Adding error:", err);
    return res.status(500).json({message:"Internal server error."})
}
}
async function archiveProduct(req, res) {
  try {
    const { id } = req.body;
    const adminEmail = req.session.user;
    const adminId = req.session.userID;
    if (!id) {
      return res.status(400).json({ message: "Product ID is required." });
    }
    const product = await models['Products'].findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }

    if (product.product_Stock > 0){
      return res.status(400).json({message: "Cannot Archive Product with Stock"});
    }

    if (adminId) {
        await models.AdminLogActivity.create({
            adminId: adminId,
            action: 'ARCHIVE',
            actionDetails: `Archived product: ${product.product_Name}`,
            productId: id,
            timestamp: new Date()
        });
        console.log(`✅ Admin ${adminEmail} archived product: ${product.product_Name}`);
    }
    product.isArchived = true;
    await product.save();

    return res.status(200).json({ message: "Product archived successfully." });
  } catch (err) {
    console.error("Archive error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}


async function addProduct(req, res) {
  try {
    const { product_Name,product_Description, product_RetailPrice, product_BuyingPrice,product_Category, product_Stock, product_Expiry } = req.body;
    const adminEmail = req.session.user;
    const adminId = req.session.userID;

    const existing = await models["Products"].findOne({
      where: { product_Name: product_Name.trim() },
    });

    if (existing) {
      return res.status(400).json({ message: "Product name already exists" });
    }

        const id = generateProductId();
    const newProduct = await models["Products"].create({
      id,
      product_Name,
      product_Description,
      product_RetailPrice,
      product_BuyingPrice,
      product_Stock,
      product_Category,
      product_Expiry
    });
    const today = new Date();
    const expiry = new Date(product_Expiry);
    const diff = (expiry - today) / (1000 * 60 * 60 * 24);

    if (expiry < today) {
      return res.status(400).json({ message: "Cannot add expired product." });
    } else if (diff <= 5) {
      return res.status(400).json({ message: "Product expires too soon (within 5 days)." });
    }
  const baseUrl = process.env.APP_URL || 'http://localhost:5173';
  const qrValue = `http://localhost:3000/products/scan/${newProduct.id}`;
  const svgString = await QRCode.toString(qrValue, { type: 'svg', margin: 1 });

    fs.mkdirSync(UPLOAD_DIR, { recursive: true });

    const fileName = `qr_product_${newProduct.id}_${Date.now()}.svg`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    fs.writeFileSync(filePath, svgString, 'utf8');

    const publicPath = `/uploads/qrcodes/${fileName}`;
    await newProduct.update({
      product_QrCodeValue: qrValue,
      product_QrCodePath: publicPath
    });
    if (adminId) {
        await models.AdminLogActivity.create({
            adminId: adminId,
            action: 'CREATE',
            actionDetails: `Created product: ${product_Name}`,
            productId: newProduct.id,
            timestamp: new Date()
        });
        console.log(`✅ Admin activity logged for product creation`);
    }
    res.status(201).json(newProduct);

  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: err.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.body;
    const adminEmail = req.session.user;
    const adminId = req.session.userID;
    const product = await models["Products"].findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.product_Stock > 0) {
      return res.status(400).json({ message: "Product still has stock." });
    }
    if (adminId) {
        await models.AdminLogActivity.create({
            adminId: adminId,
            action: 'DELETE',
            actionDetails: `Permanently deleted product: ${product.product_Name}`,
            productId: id,
            timestamp: new Date()
        });
        console.log(`⚠️ Admin ${adminEmail} deleted product: ${product.product_Name}`);
    }
    if (product.product_QrCodePath) {
      const qrFilePath = path.join(__dirname, "..", "..", "public", product.product_QrCodePath);
      if (fs.existsSync(qrFilePath)) {
        fs.unlinkSync(qrFilePath);
        console.log(`Deleted QR code: ${qrFilePath}`);
      } else {
        console.log("QR file not found, skipping deletion.");
      }
    }

    await models["Products"].destroy({ where: { id } });

    return res.status(200).json({ message: "Product and QR deleted successfully" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}



async function updateProduct(req, res) {
  try {
    const { id, product_Name, product_RetailPrice, product_BuyingPrice,product_Description,product_Category, product_Stock, product_Expiry } = req.body;
    const adminEmail = req.session.user;
    const adminId = req.session.userID;
    const product = await models["Products"].findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if(adminId){
      let changes = [];

        if (product.product_Name !== product_Name) {
              changes.push(`Name: "${product.product_Name}" → "${product_Name}"`);
        }
        if (parseFloat(product.product_RetailPrice) !== parseFloat(product_RetailPrice)) {
              changes.push(`Retail: ${product.product_RetailPrice} → ${product_RetailPrice}`);
        }
        if (parseFloat(product.product_BuyingPrice) !== parseFloat(product_BuyingPrice)) {
            changes.push(`Cost: ${product.product_BuyingPrice} → ${product_BuyingPrice}`);
        }
        if (product.product_Category !== product_Category) {
            changes.push(`Category: ${product.product_Category} → ${product_Category}`);
        }
        if (parseInt(product.product_Stock) !== parseInt(product_Stock)) {
            changes.push(`Stock: ${product.product_Stock} → ${product_Stock}`);
        }
        if (product.product_Expiry?.toISOString() !== new Date(product_Expiry).toISOString()) {
            changes.push(`Expiry: ${product.product_Expiry} → ${product_Expiry}`);
        }
        const actionDetails = changes.length > 0 
            ? `Updated: ${changes.join(' | ')}`
            : 'No changes made';
        
        await models.AdminLogActivity.create({
            adminId: adminId,
            action: 'UPDATE',
            actionDetails: actionDetails,
            productId: id,
            timestamp: new Date()
        });
        console.log(`✅ Admin ${adminEmail} updated product ID ${id}: ${changes.length} changes`);
    }
    product.product_Name = product_Name;
    product.product_RetailPrice = product_RetailPrice;
    product.product_BuyingPrice = product_BuyingPrice;
    product.product_Description = product_Description;
    product.product_Category = product_Category; 
    product.product_Stock = product_Stock;
    product.product_Expiry = product_Expiry;
    await product.save();

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await models["Products"].findByPk(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: err.message });
  }
}
async function searchProduct(req, res) {
  try {
    const { search, category } = req.query;
    console.log("Backend:", search, category);

    const where = { isArchived: false };

    if (search) {
      where.product_Name = { [Op.like]: `${search}%` };
    }

    if (category) {
       where.product_Category = { [Op.like]: `%${category}%` };
     }

    const products = await models["Products"].findAll({ where });

    return res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    return res.status(500).json({ error: err.message });
  }
}
async function searchArchiveProduct(req, res){
 try {
    const { search, category } = req.query;
    console.log("Backend:", search, category);

    const where = { isArchived: true };

    if (search) {
      where.product_Name = { [Op.like]: `${search}%` };
    }

    if (category) {
       where.product_Category = { [Op.like]: `%${category}%` };
     }

    const products = await models["Products"].findAll({ where });

    return res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    return res.status(500).json({ error: err.message });
  }
}
// async function categoryArchiveSort(req,res){
//   try{
//     const sort = req.query.sort;
//     const sortedCategory = await models['Products'].findAll({
//       where: {product_Category: {[Op.eq]: `${sort}`},
//               isArchived:true},
//       order: [['product_Name', 'ASC']],
//     })
//     // if (!sortedCategory || sortedCategory.length === 0) {
//     //   return res.status(404).json({
//     //     message: `No products found for category: ${sort}`,
//     //   });
//     // }
//     res.status(200).json(sortedCategory);
//   }
//   catch (err){
//     console.error("Error finding Category");
//     res.status(500).json({error: err.message});
//   }
// }
// async function categorySort(req,res){
//   try{
//     const sort = req.query.sort;
//     const sortedCategory = await models['Products'].findAll({
//       where: {product_Category: {[Op.eq]: `${sort}`},
//               isArchived:false},
//       order: [['product_Name', 'ASC']],
//     })
//     // if (!sortedCategory || sortedCategory.length === 0) {
//     //   return res.status(404).json({
//     //     message: `No products found for category: ${sort}`,
//     //   });
//     // }
//     res.status(200).json(sortedCategory);
//   }
//   catch (err){
//     console.error("Error finding Category");
//     res.status(500).json({error: err.message});
//   }
// }
async function scanProduct(req, res) {
  try {
    const id = req.params.id;

    const product = await models["Products"].findByPk(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.product_Stock <= 0) {
      return res.status(400).json({ error: "Out of stock" });
    }

    // Deduct only once
    product.product_Stock -= 1;
    await product.save();

    return res.json({
      message: "Scan successful",
      newStock: product.product_Stock,
      product
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


module.exports = {
    getProducts,
    addProduct,
    deleteProduct,
    updateProduct,
    getProductById,
    searchProduct,
    //categorySort,
    archivedProducts,
    archiveProduct,
    archiveAddBack,
    searchArchiveProduct,
    //categoryArchiveSort,
    scanProduct
}