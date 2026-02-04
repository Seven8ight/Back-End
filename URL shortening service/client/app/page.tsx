"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [url, setUrl] = useState<string>(""),
    [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

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

      setGeneratedUrl(shortURLResponse.shortCode);
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
    <div>
      <div id="form" className="w-3/4 m-auto shadow-2xl">
        <h1>Generate Short URL</h1>
        <Input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          type="text"
          placeholder="Long Url"
        />
        <Button onClick={() => submitHandler()}>Generate</Button>
      </div>

      <div id="generated url" className="w-3/4 m-auto shadow-2xl">
        {!generatedUrl && <h2>Generated urls are provided here</h2>}
        {generatedUrl && (
          <div>
            <h2>Generated URL</h2>
            <p>{generatedUrl}</p>
          </div>
        )}
      </div>
    </div>
  );
}
