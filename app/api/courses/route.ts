import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  const { data } = await supabase
    .from("courses")
    .select("id, name, description, image");
  return new Response(
    JSON.stringify({
      result: data,
    }),
    { status: 200 }
  );
}
