import {http} from "./http";

export async function next_id() {
  const resp = await http.get<{ data: string }>('/next_id');
  return resp.data.data;
}
