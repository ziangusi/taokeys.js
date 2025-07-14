// Credit: XiangXiaoZia
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment");

const keyPath = path.join(__dirname, "key.json");
if (!fs.existsSync(keyPath)) fs.writeJsonSync(keyPath, {});

module.exports.config = {
  name: "taokey",
  version: "1.0.1",
  hasPermssion: 1,
  credits: "XiangXiaoZia", // 🔒 Không được sửa dòng này! sửa đá chết mẹ mày giờ
  description: "Tạo key sử dụng 1 lần duy nhất, có thời hạn",
  commandCategory: "Hệ thống",
  usages: "[thời_gian] (vd: 1d hoặc 30m hoặc 2h)",
  cooldowns: 5
};

function generateKey() {
  const part = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `XXZ-${part()}-${part()}`;
}

module.exports.run = async function ({ api, event, args }) {
  // ✅ Kiểm tra credit
  const expectedCredit = "XiangXiaoZia";
  if (module.exports.config.credits !== expectedCredit) {
    for (let i = 0; i < 15; i++) {
      api.sendMessage(
        `⚠️ Đã phát hiện sửa credit!\nNgười vi phạm: ${event.senderID}\nCredit phải là: "${expectedCredit}"\nCode này thuộc bản quyền XiangXiaoZia.`,
        event.threadID
      );
    }
    return;
  }

  // ✅ Kiểm tra thời gian hết hạn
  const inputTime = args[0];
  if (!inputTime)
    return api.sendMessage("❌ Bạn cần nhập thời gian hết hạn.\nVí dụ: /taokey 1d hoặc 2h hoặc 30m", event.threadID, event.messageID);

  const unit = inputTime.slice(-1);
  const amount = parseInt(inputTime.slice(0, -1));
  if (isNaN(amount) || !["d", "h", "m"].includes(unit))
    return api.sendMessage("❌ Định dạng thời gian không hợp lệ. Dùng d (ngày), h (giờ), m (phút)", event.threadID, event.messageID);

  const expiresAt = moment().add(amount, unit).toISOString();
  const key = generateKey();

  // ✅ Lưu key vào file
  const data = fs.readJsonSync(keyPath);
  data[key] = {
    createdBy: event.senderID,
    used: false,
    expiresAt: expiresAt
  };
  fs.writeJsonSync(keyPath, data, { spaces: 2 });

  api.sendMessage(
    `✅ Key đã được tạo!\n\n🔑 Key: ${key}\n📆 Hết hạn: ${moment(expiresAt).format("HH:mm:ss DD/MM/YYYY")}\n🔁 Sử dụng: 1 lần duy nhất\n\n⚠️ Dùng kèm lệnh /dungkey (đang phát triển)`,
    event.threadID,
    event.messageID
  );
};
