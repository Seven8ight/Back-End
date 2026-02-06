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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";

const Urls = (): React.ReactNode => {
  const [Urls, setUrls] = useState<shortURL[]>([]),
    [newUrl, setUrl] = useState<string>("");

  const fetchUrls = async () => {
      const urlsFetch = await fetch("/api/urls?type=all", {
          method: "GET",
        }),
        urlsResponse = await urlsFetch.json();

      if (!urlsFetch.ok) {
        toast.error(`Error occured, ${urlsResponse.error}`);
        return;
      }

      setUrls(urlsResponse);
    },
    updateHandler = async (shortCode: string) => {
      if (newUrl.length <= 0) toast.error("Url input must be provided");
      else if (!newUrl.includes("http") && !newUrl.includes("https"))
        toast.error("Url not valid");

      try {
        const updateRequest = await fetch(`/api/urls?shortcode=${shortCode}`, {
            method: "PUT",
            body: JSON.stringify({
              url: newUrl,
            }),
          }),
          updateResponse = await updateRequest.json();

        if (!updateRequest.ok) {
          toast.error(`Error: ${updateResponse.error}`);
          return;
        }

        toast.success("Url updated successfully");
        await fetchUrls();
      } catch (error) {
        toast.error(`Error: ${(error as Error).message}`);
      }
    },
    deleteHandler = async (shortCode: string) => {
      try {
        const deleteRequest = await fetch(`/api/urls?shortcode=${shortCode}`, {
            method: "DELETE",
          }),
          deleteResponse = await deleteRequest.json();

        if (!deleteRequest.ok) {
          toast.error(`Error: ${deleteResponse.error}`);
          return;
        }

        toast.success("Short url deleted successfully", {
          position: "top-center",
        });
        await fetchUrls();
      } catch (error) {
        toast.error(`Error: ${(error as Error).message}`);
      }
    };

  useEffect(() => {
    (async () => {
      await fetchUrls();
    })();
  }, []);

  return (
    <>
      {Urls.map((url) => (
        <motion.div
          layout
          className="relative top-10 w-[95vw] m-auto mb-10"
          key={url.id}
        >
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
                          value={newUrl}
                          onChange={(event) => setUrl(event.target.value)}
                        />
                        <div
                          id="buttons"
                          className="flex flex-row justify-between"
                        >
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant={"destructive"}>
                                <i className="fa-solid fa-trash-can"></i>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete your account from our
                                  servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteHandler(url.shortcode)}
                                >
                                  Continue
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <div>
                            <Button
                              variant={"default"}
                              className="mr-3"
                              onClick={() => updateHandler(url.shortcode)}
                            >
                              Submit
                            </Button>
                            <DialogClose asChild>
                              <Button variant={"secondary"}>Cancel</Button>
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
        </motion.div>
      ))}
    </>
  );
};

export default Urls;
