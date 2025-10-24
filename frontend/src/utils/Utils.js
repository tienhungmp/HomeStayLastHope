const timeZone = 'Asia/Ho_Chi_Minh';
import moment from 'moment';

import regex from './regex';
// import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
// import { db } from '../firebase'
import { toast } from 'react-toastify';
// import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
// import { storage } from '../firebase'
import clsx from 'clsx';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { twMerge } from 'tailwind-merge';
import { v4 } from 'uuid';
import { storage } from '../config/firebaseConfig';
import { ROLES } from './constants';

export const convertStringToNumber = (value, delimiter = '.') => {
    if (value || value === 0) {
        return `${value.toString().replace(regex.formatMoney, delimiter)} đ`
    }
    return '0'
}

export const partStringToNumber = (value, delimiter = '.') => {
    if (value || value === 0) {
        return `${value.toString().replace(regex.formatMoney, delimiter)}`
    }
    return '0'
}

export const ToastInfo = (mes = 'Thông báo mới') => {
    toast.info(mes, {
        position: 'top-right',
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: 'light',
    })
}

export const ToastNoti = (mes = 'Lưu dữ liệu thành công') => {
    toast.success(mes, {
        position: 'top-right',
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: 'light',
    })
}
export const ToastUpdate = (mes = 'Thay đổi dữ liệu thành công') => {
    toast.success(mes, {
        position: 'top-right',
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: 'light',
    })
}
export const ToastDel = (mes = 'Đã xoá dữ liệu thành công') => {
    toast.success(mes, {
        position: 'top-right',
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: 'light',
    })
}
export const ToastNotiError = (mes = 'Hệ thống lỗi') => {
    toast.error(mes, {
        position: 'top-right',
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: 'light',
    })
}

export const getDate = (timestamp, type = 1, format = 'DD/MM/YYYY') => {
    if (timestamp == null) {
        return null
    }
    let result = null
    switch (type) {
        case 1:
            result = moment(timestamp).format('yyyy-MM-DD')
            break
        case 2:
            result = moment(timestamp).format('DD.MM.yyyy - HH:mm')
            break
        case 3:
            result = moment(timestamp).format('HH:mm')
            break
        case 4:
            result = moment(timestamp).format('MM/YYYY')
            break
        case 5:
            result = moment(timestamp).format(format)
            break
        case 6:
            result = result = new Date(
                timestamp.year,
                timestamp.month - 1, // Tháng bắt đầu từ 0
                timestamp.day,
                timestamp.hour,
                timestamp.minute,
                timestamp.second,
                timestamp.millisecond
            );
            break;
        case 7:
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone,
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: false,
                fractionalSecondDigits: 3,
            });
            const parts = formatter.formatToParts(timestamp);
            const dateObj = {};
            parts.forEach(part => {
                if (part.type !== 'literal') {
                    dateObj[part.type] = parseInt(part.value, 10);
                }
            });
            const offset = -date.getTimezoneOffset() * 60 * 1000;
            result = {
                year: dateObj.year,
                month: dateObj.month,
                day: dateObj.day,
                hour: dateObj.hour,
                minute: dateObj.minute,
                second: dateObj.second,
                millisecond: date.getMilliseconds(),
                timeZone: timeZone,
                offset: offset,
                era: dateObj.year >= 1 ? 'AD' : 'BC',
                calendar: { identifier: 'gregory' },
            };
            break;
        case 8:
            result = result = new Date(
                timestamp.year,
                timestamp.month - 1,
                timestamp.day,
            );
            break;
        case 9:
            const newDate =
                timestamp.year + '/' + timestamp.month + '/' + timestamp.day;
            result = moment(newDate, 'YYYY/MM/DD').format('YYYY-MM-DD');
            break;
        default:
            break
    }
    return result
}

// Hàm loại bỏ dấu tiếng Việt
export function removeVietnameseAccent(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function searchNameWithoutVietnameseAccent(listData, keyword) {
    // Chuẩn hóa keyword tìm kiếm và tên trong mảng
    const normalizedKeyword = removeVietnameseAccent(keyword.toLowerCase())
    const normalizedNames = listData.map(item => removeVietnameseAccent(item.fullName.toLowerCase()))

    // Tìm kiếm tên không phân biệt dấu
    const result = listData.filter((item, index) => {
        const normalizedFullName = normalizedNames[index]
        return normalizedFullName.includes(normalizedKeyword)
    })

    return result
}

export const getTime = inputTime => {
    if (inputTime || inputTime === '0:00') {
        return moment(inputTime, 'HH:mm:ssZ').format('H:mm')
    }
    return '0'
}

export function uploadFirebase(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            console.log('No file selected.')
            reject(new Error('No file selected.'))
            return
        }

        const uniqueFileName = `${v4()}_${file.name}`
        const imageRef = ref(storage, `avatar/${uniqueFileName}`)

        uploadBytes(imageRef, file)
            .then(snapshot => {
                getDownloadURL(snapshot.ref)
                    .then(downloadURL => {
                        resolve(downloadURL)
                    })
                    .catch(error => {
                        console.error('Error getting download URL:', error)
                        reject(error)
                    })
            })
            .catch(error => {
                console.error('Error uploading file:', error)
                reject(error)
            })
    })
}

export function cn(...args) {
    return twMerge(clsx(args))
}

export function getGGMapLink(lat, lng) {
    return `https://www.google.com/maps?q=${lat},${lng}`
}


export function differenceInTime(startTime, endTime) {
    if (startTime == null || endTime == null) {
        return 0
    }
    const start = getDate(startTime, 8);
    const end = getDate(endTime, 8);
    // Tính chênh lệch (theo mili giây)
    const diffInMilliseconds = Math.abs(end - start);
    // Chuyển đổi sang ngày
    return diffInMilliseconds / (1000 * 60 * 60 * 24) + 1;
}
export function differenceTimeDate(startTime, endTime) {
    if (startTime == null || endTime == null) {
        return 0
    }
    const start = new Date(startTime);
    const end = new Date(endTime);
    // Tính chênh lệch (theo mili giây)
    const diffInMilliseconds = Math.abs(end - start);
    // Chuyển đổi sang ngày
    return diffInMilliseconds / (1000 * 60 * 60 * 24) + 1;
}

export function getBranchId(auth) {
    if (auth.roles[0] === ROLES.HOST) {
        return auth._id;
    }
    if (auth.roles[0] === ROLES.EMPLOYEE) {
        return auth.bossId;
    }
    return null;
}
