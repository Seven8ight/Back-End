import { Button } from "@/components/ui/button";
import Link from "next/link";

const Navbar = (): React.ReactNode => {
  return (
    <nav className="w-[95vw] flex flex-row border-b-2 m-auto p-2 relative top-5">
      <h1 className="relative left-1 text-2xl">Inclyne</h1>

      <div className="relative left-115">
        <Button variant={"link"} className="hover:border-b-[#E5857B]">
          <Link href="/">Shorten URL</Link>
        </Button>
        <Button variant={"link"} className="hover:border-b-[#E5857B]">
          <Link href="/urls">Generated URLs</Link>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
