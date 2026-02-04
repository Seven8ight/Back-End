"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { shortURL } from "../page";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const Urls = (): React.ReactNode => {
  const [Urls, setUrls] = useState<shortURL[]>([]);

  useEffect(() => {
    (async () => {
      const urlsFetch = await fetch("/api/urls?type=all", {
          method: "GET",
        }),
        urlsResponse = await urlsFetch.json();

      if (!urlsFetch.ok) {
        toast.error(`Error occured, ${urlsResponse.error}`);
        return;
      }

      setUrls(urlsResponse);
    })();
  }, []);

  return (
    <>
      {Urls.map((url) => (
        <div className="relative top-10 w-[95vw] m-auto mb-10" key={url.id}>
          <div id="url" className="shadow-xl rounded-xl p-5 relative">
            <div
              id="liner"
              className="w-1.25 h-[95%] bg-[#E5857B] rounded-tl-3xl rounded-bl-3xl absolute top-0 left-[0.5px]"
            />
            <div id="content" className="flex items-center justify-between">
              <div id="left">
                <h2 className="text-gray-400 mb-2">13/01/2025</h2>
                <p className="mb-2 text-[#7D8BAE]">{url.url}</p>
                <p className="mr-10">{`http://localhost:4000/${url.shortcode}`}</p>
              </div>
              <div id="right" className="flex flex-col ">
                <p className="mb-5 font-bold">Visit count: {url.accesscount}</p>
                <div className="flex justify-between">
                  <Button className="p-3">
                    <Link
                      target="_blank"
                      href={`http://localhost:4000/${url.shortcode}`}
                    >
                      <i className="fa-solid fa-link"></i>
                    </Link>
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="p-3">
                        <i className="fa-solid fa-gear"></i>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit short url</DialogTitle>
                        <DialogDescription>
                          Update the short url's current original url.
                        </DialogDescription>
                      </DialogHeader>
                      <div>
                        <h3 className="mb-2">New url</h3>
                        <Input
                          type="text"
                          className="mb-5"
                          placeholder="new url for short code"
                        />
                        <div
                          id="buttons"
                          className="flex flex-row justify-between"
                        >
                          <Button variant={"destructive"}>
                            <i className="fa-solid fa-trash-can"></i>
                          </Button>
                          <div>
                            <Button variant={"default"} className="mr-3">
                              Submit
                            </Button>
                            <DialogClose asChild>
                              <Button variant={"secondary"} className="">
                                Cancel
                              </Button>
                            </DialogClose>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default Urls;
