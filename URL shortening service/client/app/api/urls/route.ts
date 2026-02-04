import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams,
      type = searchParams.get("type");

    let requestUrl: string = "";

    switch (type) {
      case "all":
        requestUrl = "http://localhost:4000/shorten?type=all";
        break;
      case "one": {
        const shortCode = searchParams.get("shortcode");
        requestUrl = `http://localhost:4000/shorten?type=one&shortcode=${shortCode}`;
        break;
      }
      default:
        return NextResponse.json({
          error: "Type not provided on search param",
        });
    }

    const fetchUrl = await fetch(requestUrl, {
        method: "GET",
      }),
      fetchResponse = await fetchUrl.json();

    if (!fetchUrl.ok) {
      return NextResponse.json({
        error: "",
      });
    }

    return NextResponse.json(fetchResponse);
  } catch (error) {
    return NextResponse.json({
      error: (error as Error).message,
    });
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const requestBody = await request.json();

    if (!requestBody.url) {
      return NextResponse.json({
        error: "Provide url first",
      });
    }

    const generateUrlRequest = await fetch("http://localhost:4000/shorten", {
        method: "POST",
        body: JSON.stringify(requestBody),
      }),
      generateUrlResponse = await generateUrlRequest.json();

    if (!generateUrlRequest.ok) {
      return NextResponse.json({
        error: generateUrlResponse.error,
      });
    }

    return NextResponse.json(generateUrlResponse);
  } catch (error) {
    return NextResponse.json({
      error: (error as Error).message,
    });
  }
};

export const PUT = async (request: NextRequest) => {
  try {
  } catch (error) {
    return NextResponse.json({
      error: (error as Error).message,
    });
  }
};

export const DELETE = async (request: NextRequest) => {
  try {
  } catch (error) {
    return NextResponse.json({
      error: (error as Error).message,
    });
  }
};
