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
        // Lấy 6 accommodations ngẫu nhiên thỏa điều kiện
        const accommodations = await Room.aggregate([
            {
                $lookup: {
                    from: 'accommodations',
                    localField: 'accommodationId',
                    foreignField: '_id',
                    as: 'accommodation'
                }
            },
            { $unwind: '$accommodation' },
            // Chỉ lấy những accommodation được hiển thị
            {
                $match: {
                    'accommodation.isVisible': true,
                    'accommodation.isVisibleAdmin': true
                }
            },
            {
                $group: {
                    _id: '$accommodation._id',
                    accommodationId: { $first: '$accommodation._id' },
                    name: { $first: '$accommodation.name' },
                    city: { $first: '$accommodation.city' },
                    address: { $first: '$accommodation.address' },
                    images: { $first: '$accommodation.images' },
                    amenities: { $first: '$accommodation.amenities' },
                    rating: { $first: '$accommodation.rating' },
                    pricePerNight: { $first: '$pricePerNight' },
                }
            },
            { $sample: { size: 6 } },
            {
                $project: {
                    _id: 0,
                    accommodationId: 1,
                    name: 1,
                    city: 1,
                    address: 1,
                    images: 1,
                    amenities: 1,
                    rating: 1,
                    pricePerNight: 1
                }
            }
        ]);

        res.json({ accommodations });
    } catch (error) {
        console.error('Error fetching random accommodations:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
