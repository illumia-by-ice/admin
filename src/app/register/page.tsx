import { Google } from "iconsax-react";

const Page = () => {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="w-full md:w-[60%] lg:w-[50%] xl:w-[35%] shadow-lg rounded-lg p-10 flex flex-col items-center">
        <img src="/images/img-auth-login.png" alt="" />
        <h1 className="text-center text-xl font-semibold">Register</h1>
        <p className="mt-3">Already have an account? <a href="/login"><span className="text-green-600">Log In</span></a></p>
        <div className="w-full">
          <form className="mt-8 flex flex-col items-center w-full gap-3">
          <input
              type="text"
              name="firstName"
              id="firstName"
              placeholder="First Name"
              className="p-3 border-2 w-[90%] outline-none rounded-lg border-black/40"
            />
            <input
              type="text"
              name="lastName"
              id="lastName"
              placeholder="Last Name"
              className="p-3 border-2 w-[90%] outline-none rounded-lg border-black/40"
            />
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email Address"
              className="p-3 border-2 w-[90%] outline-none rounded-lg border-black/40"
            />
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              className="p-3 border-2 w-[90%] outline-none rounded-lg border-black/40"
            />
            
            <button type="submit" className="w-[90%] p-3 text-white bg-green-600 rounded-lg">Register</button>
          </form>
          <a href="https://6z3n7bx4-7000.euw.devtunnels.ms/api/auth/google" className="flex justify-center"><button className="mt-3 w-[90%] p-3 text-green-600 bg-white rounded-lg flex items-center justify-center gap-3 border-2 border-green-600"><Google size="26" color="#16a34a"/><span>Continue with Google</span></button></a>
        </div>
      </div>
    </div>
  );
};

export default Page;
