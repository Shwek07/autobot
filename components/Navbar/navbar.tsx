import Link from "next/link";
import Image from "next/image";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  return (
    <nav>
      <div className="navbar-container">
        <Link href="/">
          <Image src="/Logo.png" alt="Logo" width={130} height={50} />
        </Link>

        <div className="desktop-menu">
          <Link href="/">Home</Link>
          <Link href="/autobot">AutoBot</Link>
          <Link href="/onderdelen">Onderdelen</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
        </div>

        <Link href="/login" className="cta-button">
          Call us now: +597 868-5952
        </Link>

        {/* Client-side mobile menu */}
        <MobileMenu />
      </div>
    </nav>
  );
}
