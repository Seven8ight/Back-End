import { Button } from "@/components/ui/button";
import Link from "next/link";

const Navbar = (): React.ReactNode => {
  return (
    <nav className="w-full flex-row">
      <h1>Inclyne</h1>

      <div className="self-center">
        <Button variant={"link"}>
          <Link href="/">Shorten URL</Link>
        </Button>
        <Button variant={"link"}>
          <Link href="/urls">Generated URLs</Link>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
