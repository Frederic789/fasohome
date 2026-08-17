import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/fasohome-logo.png"
            alt="FasoHome"
            width={220}
            height={80}
            priority
             className="h-auto w-[180px] md:w-[220px]"
          />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-gray-700 lg:flex">
          <Link href="/#properties" className="hover:text-green-700">
            Buy
          </Link>

          <Link href="/#properties" className="hover:text-green-700">
            Rent
          </Link>

          <Link href="/#properties" className="hover:text-green-700">
            Land
          </Link>
        </nav>

        <Link
          href="/list-property"
          className="rounded-lg bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800"
        >
          List a property
        </Link>
      </div>
    </header>
  );
}