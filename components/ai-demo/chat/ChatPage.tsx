"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import MultiTurnChat from "./MultiTurnChat";
import SingleTurnChat from "./SingleTurnChat";

export default function ChatPage() {
  const t = useTranslations("AIDemo.chat");

  return (
    <Tabs defaultValue="single" className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
        <TabsTrigger value="single">
          {t("singleTurn")}
        </TabsTrigger>
        <TabsTrigger value="multi">
          {t("multiTurn")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="single" className="mt-0">
        <SingleTurnChat />
      </TabsContent>
      <TabsContent value="multi" className="mt-0">
        <MultiTurnChat />
      </TabsContent>
    </Tabs>
  );
}
