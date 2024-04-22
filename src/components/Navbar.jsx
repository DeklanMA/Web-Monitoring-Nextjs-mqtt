import Image from "next/image";

export const Navbar = () => {
  return (
    <div className="navbar bg-slate-50 w-full grid border-b-2">
      <div className="flex justify-center content-start pb-3">
        <Image src="/assets/logo.jpeg" width={50} height={50} />
        <a className="btn btn-ghost text-xl text-black">Water Monitoring</a>
      </div>
    </div>
  );
};
