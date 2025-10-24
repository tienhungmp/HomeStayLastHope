import express from 'express';
// import Accommodation from '../models/schemas/Accommodation.schema.js';
import Room from '../models/schemas/Room.schema.js';
import Ticket from '../models/schemas/Ticket.schema.js';
const router = express.Router();

const averageTickets = async (tickets) => {
    const ticketAverages = tickets.map(ticket => {
        // lấy giá của các đã đặt trong vé
        const roomPrices = ticket.rooms.map(roomBooking => roomBooking.roomId.pricePerNight);

        // Tính giá trung bình của các phòng trong vé
        const totalRoomPrice = roomPrices.reduce((acc, price) => acc + price, 0);
        const averageRoomPrice = roomPrices.length > 0 ? totalRoomPrice / roomPrices.length : 0;

        return {
            ticketId: ticket._id,
            averageRoomPrice: averageRoomPrice,
        };
    });
    const totalAveragePrice = ticketAverages.reduce((acc, ticket) => acc + ticket.averageRoomPrice, 0);
    return ticketAverages.length > 0 ? totalAveragePrice / ticketAverages.length : 0;
}

async function getCitiesWithCount(tickets) {
    // Lọc ra tất cả các thành phố mà người dùng đã đặt
    const cities = tickets.map(ticket => ticket.accommodation?.city).filter(Boolean);
    return cities;
}

// Hàm lấy tất cả các amenities xuất hiện trong các Accommodation của các vé
async function getAllUniqueAmenities(tickets, top = 5) {
    const allAmenities = tickets.flatMap(ticket => ticket.accommodation?.amenities || []);
    const amenitiesCount = allAmenities.reduce((countMap, amenity) => {
        countMap[amenity] = (countMap[amenity] || 0) + 1;
        return countMap;
    }, {});

    return Object.entries(amenitiesCount)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, top)
        .map(([amenity]) => amenity);
}

router.get('/', async (req, res) => {
    try {
        const { id } = req.query;

        // Lấy lịch sử vé đã đặt của người dùng
        const tickets = await Ticket.find({
            userId: id
        }).populate({
            path: 'accommodation',
            select: 'city amenities',
        }).populate({
            path: 'rooms.roomId',
            select: 'pricePerNight'
        });

        if (tickets.length === 0) {
            return res.json({ recommendations: [], message: 'Người dùng chưa có lượt đặt phòng nào.' });
        }

        //1 Lấy giá phòng trung bình
        const avgPrice = await averageTickets(tickets)

        //2 Tập hợp các địa điểm thanh phố với số lần xuất hiện
        const citylist = await getCitiesWithCount(tickets)

        // 3. Lấy ra các tiện ích xuất hiện nhiều nhất trong các lượt
        const topAmenities = await getAllUniqueAmenities(tickets, 5);
        // res.json({ recommendations: tickets });

        const allRooms = await Room.find().populate('accommodationId').exec()

        const recommendations = allRooms
            .map(room => {
                // Xử lý tính tương đồng về giá
                const priceSimilarity = 1 - Math.abs(room.pricePerNight - avgPrice) / avgPrice;


                // Xử lý tính tương đồng về thành phố
                const accommodationDetail = room.accommodationId;
                const citySimilarity = citylist.includes(accommodationDetail.city) ? 1 : 0;

                // Độ tương đồng về tiện ích
                const amenitiesSimilarity = accommodationDetail.amenities.filter(a => topAmenities.includes(a)).length / topAmenities.length;

                // Tổng hợp độ tương đồng
                const totalSimilarity = (priceSimilarity + citySimilarity + amenitiesSimilarity) / 3;
                return { room, similarity: totalSimilarity };
            })
            .filter(({ similarity }) => similarity > 0.5) // Lọc những lượt có độ tương đồng thấp hơn 0.5
            .sort((a, b) => b.similarity - a.similarity) // Sắp xếp theo độ tương đồng
            .slice(0, 6); // Giới hạn 6 chuyến phù hợp nhất

        res.json({ recommendations: recommendations.map(r => r.room) });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Hệ thống lỗi', error: error.message });
    }
});
export default router;
