import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          403
        </h1>
        <h2 className="text-2xl font-semibold mb-2">
          Unauthorized Access
        </h2>
        <p className="text-gray-600 mb-6">
          Sorry, you do not have the necessary permissions to access this page.
        </p>
        <Link
          to="/"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;