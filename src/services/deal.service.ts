import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  CreateDealRequest,
  DealDetail,
  JoinDealResponse,
  MyDeal,
  MyDealsParams,
  NearbyDeal,
  NearbyDealsParams,
  Page,
} from "@/schemas/deal.schema";
import type { DealReceipt } from "@/types/deal.types";

export async function createDeal(
  request: CreateDealRequest,
): Promise<DealDetail> {
  const { data } = await apiClient.post<DealDetail>(
    endpoints.deals.root,
    request,
  );
  return data;
}

export async function getDeal(
  dealId: string,
  viewer?: { lat: number; lng: number },
): Promise<DealDetail> {
  const { data } = await apiClient.get<DealDetail>(
    endpoints.deals.byId(dealId),
    { params: viewer },
  );
  return data;
}

export async function getNearbyDeals(
  params: NearbyDealsParams,
): Promise<Page<NearbyDeal>> {
  const { data } = await apiClient.get<Page<NearbyDeal>>(
    endpoints.deals.nearby,
    { params },
  );
  return data;
}

export async function getMyDeals(params: MyDealsParams): Promise<Page<MyDeal>> {
  const { data } = await apiClient.get<Page<MyDeal>>(endpoints.deals.mine, {
    params,
  });
  return data;
}

export async function joinDeal(dealId: string): Promise<JoinDealResponse> {
  const { data } = await apiClient.post<JoinDealResponse>(
    endpoints.deals.join(dealId),
  );
  return data;
}

export async function leaveDeal(dealId: string): Promise<DealDetail> {
  const { data } = await apiClient.post<DealDetail>(
    endpoints.deals.leave(dealId),
  );
  return data;
}

export async function cancelDeal(dealId: string): Promise<DealDetail> {
  const { data } = await apiClient.delete<DealDetail>(
    endpoints.deals.byId(dealId),
  );
  return data;
}

export async function confirmReceipt(dealId: string): Promise<DealDetail> {
  const { data } = await apiClient.post<DealDetail>(
    endpoints.deals.confirmReceipt(dealId),
  );
  return data;
}

export async function getDealReceipt(dealId: string): Promise<DealReceipt> {
  const { data } = await apiClient.get<DealReceipt>(
    endpoints.deals.receipt(dealId),
  );
  return data;
}
