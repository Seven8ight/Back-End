import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams,
      type = searchParams.get("type");

    switch (type) {
      case "all":
        break;
      case "one": {
        const url = searchParams.get("url");
        break;
      }
      default:
        break;
    }
  } catch (error) {
    return NextResponse.json({
      error: (error as Error).message,
    });
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const requestBody = await request.json();
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
