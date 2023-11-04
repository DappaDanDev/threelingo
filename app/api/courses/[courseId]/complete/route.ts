import { NextRequest } from "next/server";
import { ethers } from "ethers";
import { getPeanutLink } from "@/lib/peanut";

export const POLYGON_ZKEVM_TESTNET_RPC_URL =
  "https://rpc.public.zkevm-test.net";
export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const threelingoWallet = new ethers.Wallet(
    process.env.WALLET_PRIVATE_KEY!,
    new ethers.providers.JsonRpcProvider(POLYGON_ZKEVM_TESTNET_RPC_URL)
  );
  const link = await getPeanutLink(threelingoWallet, params.courseId as any);
  return new Response(
    JSON.stringify({
      link,
    }),
    { status: 200 }
  );
}
