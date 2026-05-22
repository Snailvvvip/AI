import {iBaseRecord} from "./BaseRecord";

export interface iResumeRecord extends Partial<iBaseRecord> {
  image?: string,
  fullName?: string,
  jsonString?: string,
  remarks: string,
  isTemplate: 'K',
}
