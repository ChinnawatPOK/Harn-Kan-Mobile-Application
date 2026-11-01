import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  CreateDealInput,
  DealDetail,
  DealDetailParams,
  DealReceipt,
  JoinDealResponse,
  MyDealsParams,
  MyDeal,
  NearbyDealsParams,
  NearbyDealsResponse,
  PageResponse,
} from "@/types/deal.types";

export async function createDeal(input: CreateDealInput): Promise<DealDetail> {
  const { data } = await apiClient.post<DealDetail>(endpoints.deals.create, input);
  return data;
}

export async function getNearbyDeals(
  params: NearbyDealsParams,
): Promise<NearbyDealsResponse> {
  const { data } = await apiClient.get<NearbyDealsResponse>(
    endpoints.deals.nearby,
    { params },
  );
  return data;
}

export async function getDeal(
  dealId: string,
  params?: DealDetailParams,
): Promise<DealDetail> {
  const { data } = await apiClient.get<DealDetail>(
    endpoints.deals.byId(dealId),
    { params },
  );
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

export async function getMyDeals(
  params: MyDealsParams = {},
): Promise<PageResponse<MyDeal>> {
  const { data } = await apiClient.get<PageResponse<MyDeal>>(
    endpoints.deals.mine,
    { params },
  );
  return data;
}

export async function confirmDealReceipt(
  dealId: string,
): Promise<DealDetail> {
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
