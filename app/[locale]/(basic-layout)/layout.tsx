import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export default async function BasicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Header />
      <main className="flex-1 flex flex-col items-center">{children}</main>
      <Footer />
    </NextIntlClientProvider>
  );
}
