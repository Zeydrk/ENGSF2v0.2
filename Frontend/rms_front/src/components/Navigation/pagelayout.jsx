import Navigation from './navbar.jsx';

const PageLayout = ({ children, user, cartItemsCount = 0 }) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-red-50">
      <Navigation user={user} cartItemsCount={cartItemsCount} />
      <main className="max-w-7xl mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  );
};

export default PageLayout;