import crypto from "crypto";
import Refer from "../models/referModel.js";

export const generateReferralcode = async () => {
  let code;
  let exists = true;

  while (exists) {
    code = crypto.randomBytes(4).toString("hex").toUpperCase();

    exists = await Refer.findOne({
      referralCode: code,
    });
  }

  return code;
};