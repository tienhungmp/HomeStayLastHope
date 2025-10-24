
import file from './sheet.csv';
import Papa from 'papaparse';


export const convertCSVLocation = () => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            download: true,
            complete: (results) => {
                resolve(results.data);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};

// Hàm chuyển đổi key
function chuyenDoiKey(obj) {
    const newObj = {};
    for (let key in obj) {
        let newKey;
        // Chuyển đổi key dựa trên giá trị của key
        if (key === "01") {
            newKey = "id1";
        } else if (key === "001") {
            newKey = "id2";
        } else if (key === "00001") {
            newKey = "id3";
        } else if (key.includes("Phường")) {
            newKey = "label3";
        } else if (key.includes("Quận") || key.includes("Huyện")) {
            newKey = "label2";
        } else if (key.includes("Thành phố") || key.includes("Tỉnh")) {
            newKey = "label1";
        } else {
            newKey = key; // Giữ nguyên key nếu không phù hợp với các điều kiện trên
        }
        newObj[newKey] = obj[key];
    }
    return newObj;
}
export const getProvinces = async () => {
    try {
        const data = await convertCSVLocation();
        const newData = data.map(obj => chuyenDoiKey(obj));
        let provinces = [];
        provinces = newData?.map(item => ({
            value: item?.id1,
            key: item?.id1,
            label: item?.label1,
        }))

        const uniqueProvinces = provinces?.filter((province, index, self) =>
            index === self.findIndex((p) => (
                p.value === province.value
            ))
        );
        return uniqueProvinces;
    } catch (error) {
        console.error("Error occurred while parsing CSV:", error);
        return [];
    }
};
export const getDistricts = async (value) => {
    try {
        const data = await convertCSVLocation();
        const newData = data.map(obj => chuyenDoiKey(obj));
        const distrcits = newData?.filter(item => item?.id1 === value)
        const uniqueDistrict = distrcits.filter((province, index, self) =>
            index === self.findIndex((p) => (
                p.id2 === province.id2
            ))
        );
        const optionsDistricts = uniqueDistrict?.map(item => ({
            value: item?.id2,
            key: item?.id2,
            label: item?.label2,
        }))
        return optionsDistricts
    } catch (error) {
        console.error("Error occurred while parsing CSV:", error);
        return [];
    }
};
export const getWards = async (value) => {
    try {
        const data = await convertCSVLocation();
        const newData = data.map(obj => chuyenDoiKey(obj));
        const distrcits = newData?.filter(item => item?.id2 === value)
        const uniqueDistrict = distrcits.filter((province, index, self) =>
            index === self.findIndex((p) => (
                p.id3 === province.id3
            ))
        );
        const optionsWards = uniqueDistrict?.map(item => ({
            value: item?.id3,
            key: item?.id3,
            label: item?.label3,
        }))
        return optionsWards
    } catch (error) {
        console.error("Error occurred while parsing CSV:", error);
        return [];
    }
};