import {iBaseRecord} from "../../utils/BaseRecord";

export interface iFileRecord extends iBaseRecord {
  name: string;
  path: string;
  head_id?: string;
  attr1?: string;
  attr2?: string;
  attr3?: string;
}
