import { PORT } from "./../../../../Server/Config/Env";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams,
      type = searchParams.get("type");

    let requestUrl: string = "";

    switch (type) {
      case "all":
        requestUrl = `http://localhost:${PORT}/shorten?type=all`;
        break;
      case "one": {
        const shortCode = searchParams.get("shortcode");
        requestUrl = `http://localhost:${PORT}/shorten?type=one&shortcode=${shortCode}`;
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

    const generateUrlRequest = await fetch(`http://localhost:${PORT}/shorten`, {
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
    const shortCode = request.nextUrl.searchParams.get("shortcode"),
      requestBody = await request.json();

    if (!shortCode) {
      return NextResponse.json({
        error: "Shortcode not provided",
      });
    }

    if (!requestBody.url)
      return NextResponse.json({
        error: "New url not provided",
      });

    try {
      const updateURLRequest = await fetch(
          `http://localhost:${PORT}/shorten/${shortCode}`,
          {
            method: "PUT",
            body: JSON.stringify(requestBody),
          },
        ),
        updateURLResponse = await updateURLRequest.json();

      if (!updateURLRequest.ok)
        return NextResponse.json({
          error: updateURLResponse.error,
        });

      return NextResponse.json(
        {},
        {
          status: 200,
        },
      );
    } catch (error) {
      return NextResponse.json({
        error: (error as Error).message,
      });
    }
  } catch (error) {
    return NextResponse.json({
      error: (error as Error).message,
    });
  }
};

export const DELETE = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams,
      shortCode = searchParams.get("shortcode");

    if (!shortCode)
      return NextResponse.json({
        error: "Shortcode not provided",
      });

    const deleteRequest = await fetch(
        `http://localhost:${PORT}/shorten/${shortCode}`,
        {
          method: "DELETE",
        },
      ),
      deleteResponse = await deleteRequest.json();

    if (!deleteRequest.ok)
      return NextResponse.json(
        {
          error: deleteResponse.error,
        },
        {
          status: deleteRequest.status,
        },
      );

    return NextResponse.json(deleteResponse, {
      status: deleteRequest.status,
    });
  } catch (error) {
    return NextResponse.json({
      error: (error as Error).message,
    });
  }
};
