import { Locale } from "@/i18n/routing";
import { constructMetadata } from "@/lib/metadata";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LoginPage from "./LoginPage";

type Params = Promise<{ locale: string }>;

type MetadataProps = {
  params: Params;
};

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Login" });

  return constructMetadata({
    page: "Login",
    title: t("title"),
    description: t("description"),
    locale: locale as Locale,
    path: `/login`,
  });
}

export default function Login() {
  return <LoginPage />;
}
