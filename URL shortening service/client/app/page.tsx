"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";

export type shortURL = {
  id: string;
  url: string;
  shortcode: string;
  createdat: string;
  updatedat: string;
  accesscount: number;
};

export default function Home() {
  const [url, setUrl] = useState<string>(""),
    [generatedUrl, setGeneratedUrl] = useState<shortURL | null>(null);

  const submitHandler = async () => {
    if (url.length <= 0 || (!url.includes("http") && !url.includes("https")))
      toast.error("Invalid url passed in", { position: "top-center" });

    try {
      const shortURLRequest = await fetch("/api/urls", {
          method: "POST",
          body: JSON.stringify({
            url: url,
          }),
        }),
        shortURLResponse = await shortURLRequest.json();

      if (!shortURLRequest.ok) {
        toast.error(`Error occurred, ${shortURLResponse.error}`);
        return;
      }

      setGeneratedUrl(shortURLResponse);
      toast.success("Short url created successfully", {
        position: "top-center",
      });
    } catch (error) {
      toast.error("Error occurred, kindly try again", {
        position: "top-center",
      });
    }
  };

  return (
    <motion.div>
      <div
        id="form"
        className="w-3/4 m-auto shadow-2xl p-5 rounded-2xl relative top-60"
      >
        <h1 className="text-xl mb-5 font-bold">Generate Short URL</h1>
        <Input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          type="text"
          placeholder="Long Url"
          className="mb-5 border-none border-b-2"
        />
        <Button
          className="block m-auto w-40 h-15 rounded-4xl bg-[#E5857B] hover:bg-[rgba(229,133,123,0.75)] hover:cursor-pointer"
          onClick={() => submitHandler()}
        >
          Generate
        </Button>
      </div>

      <div
        id="generated url"
        className="w-3/4 m-auto shadow-2xl p-5 rounded-2xl relative top-70"
      >
        {!generatedUrl && (
          <h2 className="text-center font-extralight">
            Generated urls are provided here
          </h2>
        )}
        {generatedUrl && (
          <div>
            <h2 className="text-2xl font-semibold mb-5">Generated URL</h2>
            <h3>{generatedUrl.url}</h3>
            <Button variant={"link"}>
              <Link href={`http://localhost:4000/${generatedUrl.shortcode}`}>
                http://localhost:4000/{generatedUrl.shortcode}
              </Link>
            </Button>
            <div className="mb-5">
              <h4>{generatedUrl.createdat}</h4>
            </div>
            <Button>
              <Link
                target="_blank"
                href={`http://localhost:4000/${generatedUrl.shortcode}`}
              >
                Visit link
              </Link>
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
