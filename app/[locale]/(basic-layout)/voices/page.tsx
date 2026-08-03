import { VoiceLibrary } from "@/components/voice/VoiceLibrary";
import { PageHero } from "@/components/shared/PageHero";
import { getSession } from "@/lib/auth/server";
import { constructMetadata } from "@/lib/metadata";
import { Mic2 } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

type Params = Promise<{ locale: string }>;
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> { const { locale } = await params; return constructMetadata({ title: "My AI Singing Voices", description: "Manage your verified custom voices for AI song generation.", locale: locale as any, path: "/voices", noIndex: true }); }
export default async function VoicesPage() { const session = await getSession(); if (!session?.user) redirect("/login"); return <main className="min-h-screen w-full bg-[#fbfaf7]"><PageHero badge={{ icon: <Mic2 className="size-4" />, label: "Voice library" }} titleLines={["Your AI singing voices"]} description="Create, verify, and reuse your own voice in every song you make." /><section className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:py-9"><VoiceLibrary /></section></main>; }
