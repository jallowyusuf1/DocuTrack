export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="card">
          <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>
          <p className="text-center text-gray-600 mb-8">
            Sign in to continue to DocuTrack
          </p>
          {/* Login form will be implemented here */}
          <div className="space-y-4">
            <button className="btn w-full bg-primary-600 text-white hover:bg-primary-700">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

