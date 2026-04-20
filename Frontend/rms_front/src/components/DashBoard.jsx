
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-base-200" data-theme="autumn">
      
    
      {/* Header */}
      <div className="text-center p-6">
        <h2 className="text-2xl font-semibold text-gray-700">Dashboard</h2>
      </div>

      {/* Cards section */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Card 1 */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl font-semibold">Welcome Back!</h2>
            <p className="text-gray-600">
              Here’s a quick look at your account activity and system stats.
            </p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary btn-sm">View Details</button>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl font-semibold">Inventory</h2>
            <p className="text-gray-600">
              Check available items or add new stock to your inventory.
            </p>
            <div className="card-actions justify-end">
              <button className="btn btn-secondary btn-sm">Go to Inventory</button>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl font-semibold">Orders</h2>
            <p className="text-gray-600">
              Manage your latest orders and track fulfillment progress.
            </p>
            <div className="card-actions justify-end">
              <button className="btn btn-accent btn-sm">View Orders</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
