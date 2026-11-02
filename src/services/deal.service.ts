import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { DealReceipt } from "@/types/deal.types";
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

export async function createDeal(
  request: CreateDealRequest,
): Promise<DealDetail> {
  const { data } = await apiClient.post<DealDetail>(
    endpoints.deals.root,
    request,
    { keepRequestKeys: true },
  );
  return data;
}

export async function getDeal(
  dealId: string,
  viewer?: { lat: number; lng: number },
): Promise<DealDetail> {
  const { data } = await apiClient.get<DealDetail>(
    endpoints.deals.byId(dealId),
    { params: viewer, keepRequestKeys: true },
  );
  return data;
}

export async function getNearbyDeals(
  params: NearbyDealsParams,
): Promise<Page<NearbyDeal>> {
  const { data } = await apiClient.get<Page<NearbyDeal>>(
    endpoints.deals.nearby,
    { params, keepRequestKeys: true },
  );
  return data;
}

export async function getMyDeals(
  params: MyDealsParams,
): Promise<Page<MyDeal>> {
  const { data } = await apiClient.get<Page<MyDeal>>(endpoints.deals.mine, {
    params,
    keepRequestKeys: true,
  });
  return data;
}

export async function joinDeal(dealId: string): Promise<JoinDealResponse> {
  const { data } = await apiClient.post<JoinDealResponse>(
    endpoints.deals.join(dealId),
    undefined,
    { keepRequestKeys: true },
  );
  return data;
}

export async function leaveDeal(dealId: string): Promise<DealDetail> {
  const { data } = await apiClient.post<DealDetail>(
    endpoints.deals.leave(dealId),
    undefined,
    { keepRequestKeys: true },
  );
  return data;
}

export async function cancelDeal(dealId: string): Promise<DealDetail> {
  const { data } = await apiClient.delete<DealDetail>(
    endpoints.deals.byId(dealId),
    { keepRequestKeys: true },
  );
  return data;
}

export async function confirmReceipt(dealId: string): Promise<DealDetail> {
  const { data } = await apiClient.post<DealDetail>(
    endpoints.deals.confirmReceipt(dealId),
    undefined,
    { keepRequestKeys: true },
  );
  return data;
}

export async function getDealReceipt(dealId: string): Promise<DealReceipt> {
  const { data } = await apiClient.get<DealReceipt>(
    endpoints.deals.receipt(dealId),
    { keepRequestKeys: true },
  );
  return data;
}
