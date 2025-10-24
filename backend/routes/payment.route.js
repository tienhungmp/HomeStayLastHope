import crypto from 'crypto';
import express from 'express';
import moment from 'moment';
import querystring from 'qs';
import Payment from '../models/schemas/payment.schema.js';
import User from '../models/schemas/user.schema.js';
import { sortObject } from '../utils/vnpay.utils.js';
const router = express.Router();
//  tao giao dịch payment qua ngân hàng
router.post('/create_payment_url', async function (req, res) {
    console.log('vo day')
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');

    let ipAddr =
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    let tmnCode = process.env.VNP_TMN_CODE;
    if (!tmnCode) {
        return res.status(500).json({
            status: 500,
            message: 'Thiếu thông tin vnpay',
        });
    }
    let secretKey = process.env.VNP_HASH_SECRET;
    let vnpUrl = process.env.VNP_URL;
    let returnUrl = process.env.VNP_RETURN_URL;
    let orderId = moment(date).format('DDHHmmss');

    let { userId, amount } = req.body;
    let bankCode = req.body.bankCode;
    let locale = req.body.language;

    locale = 'vn';
    let currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    const description = `Nạp tiền vào ví`;
    vnp_Params['vnp_OrderInfo'] = description;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode) {
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);
    //  tạo ra một payment để ghi lại thông tin dữ liệu trong hệ thông mongodb
    const payment = new Payment({
        userId,
        txnRef: "I" + orderId,
        amount,
        description,
        status: 0,
    });
    const result = await payment.save();
    if (!result) {
        return res.status(500).json({
            status: 500,
            message: 'Error creating payment',
        });
    }
    let signData = querystring.stringify(vnp_Params, { encode: false });

    let hmac = crypto.createHmac('sha512', secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
    if (vnpUrl) {
        return res.status(200).json({
            status: 200,
            url: vnpUrl,
        });
    }
});

// lay giao dịch payment qua ngân hàng
router.get('/user/:id', async function (req, res) {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({
            status: 404,
            message: 'Tài khoản không tồn tại',
        });
    }
    const payments = await Payment.find({ userId: id }).sort({ createAt: -1 });
    const balance = user.balance;
    return res.status(200).json({
        status: 200,
        payments,
        balance,
    });
});
// //  cập nhật tiền cho tài khoản
// router.put('/user/:id', updatePayMentBookingForAcc)

// router.get('/:id', getPaymentDetail)

// // xác nhận trạng thái hoàn thành giao dịch
router.put('/', async function (req, res) {
    try {
        const { userId, txnRef } = req.body;
        const Code = 'I' + txnRef;

        const payment = await Payment.findOne({ txnRef: Code });

        if (!payment) {
            return res.status(404).json({
                status: 404,
                message: 'Giao dịch không tồn tại',
            });
        }

        if (payment.txnRef !== Code) {
            return res.status(400).json({
                status: 400,
                message: 'Sai mã giao dịch',
            });
        }

        if (payment.status === 1) {
            return res.status(200).json({
                status: 201,
                message: 'Giao dịch đã được hoàn thành trước đó',
            });
        }

        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'Tài khoản không tồn tại',
            });
        }

        // Cập nhật số dư người dùng
        user.balance += payment.amount;
        await user.save();

        // Cập nhật trạng thái thanh toán
        payment.status = 1;
        await payment.save();

        return res.status(200).json({
            status: 200,
            message: 'Giao dịch đã hoàn thành',
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: 'Lỗi máy chủ',
            error: err.message,
        });
    }
});


export default router;
