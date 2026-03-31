const pool = require('../config/database');
let io;

// Fungsi untuk set io dari server
const setIo = (socketIo) => {
    io = socketIo;
    console.log('✅ Socket.io set in chatController');
};

// Get or create chat room
const getOrCreateRoom = async (req, res) => {
    const { seller_id } = req.params;
    const user_id = req.user.id_user;
    
    try {
        let roomResult = await pool.query(
            `SELECT * FROM chat_room 
             WHERE (id_user = $1 AND id_seller = $2) 
                OR (id_user = $2 AND id_seller = $1)`,
            [user_id, seller_id]
        );
        
        let room = roomResult.rows[0];
        
        if (!room) {
            const newRoom = await pool.query(
                `INSERT INTO chat_room (id_user, id_seller, last_message_time)
                 VALUES ($1, $2, CURRENT_TIMESTAMP)
                 RETURNING *`,
                [user_id, seller_id]
            );
            room = newRoom.rows[0];
        }
        
        res.json({ success: true, room });
    } catch (error) {
        console.error('Get or create room error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Get user chat rooms
const getUserRooms = async (req, res) => {
    const user_id = req.user.id_user;
    
    try {
        const result = await pool.query(
            `SELECT cr.*, 
                    u1.name as user_name, u1.avatar as user_avatar,
                    u2.name as seller_name, u2.avatar as seller_avatar
             FROM chat_room cr
             LEFT JOIN users u1 ON cr.id_user = u1.id_user
             LEFT JOIN users u2 ON cr.id_seller = u2.id_user
             WHERE cr.id_user = $1 OR cr.id_seller = $1
             ORDER BY cr.last_message_time DESC`,
            [user_id]
        );
        
        res.json({ success: true, rooms: result.rows });
    } catch (error) {
        console.error('Get user rooms error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Get messages in room
const getMessages = async (req, res) => {
    const { room_id } = req.params;
    const { limit = 50, before } = req.query;
    
    try {
        let query = `
            SELECT cm.*, u.name as sender_name, u.avatar as sender_avatar
            FROM chat_message cm
            JOIN users u ON cm.id_sender = u.id_user
            WHERE cm.id_room = $1
        `;
        const values = [room_id];
        let valueIndex = 2;
        
        if (before) {
            query += ` AND cm.created_at < $${valueIndex}`;
            values.push(before);
            valueIndex++;
        }
        
        query += ` ORDER BY cm.created_at DESC LIMIT $${valueIndex}`;
        values.push(limit);
        
        const result = await pool.query(query, values);
        
        // Mark as read
        const roomResult = await pool.query(
            `SELECT id_user, id_seller FROM chat_room WHERE id_room = $1`,
            [room_id]
        );
        
        if (roomResult.rows.length > 0) {
            const room = roomResult.rows[0];
            if (req.user.id_user === room.id_user) {
                await pool.query(
                    `UPDATE chat_room SET unread_count_user = 0 WHERE id_room = $1`,
                    [room_id]
                );
            } else if (req.user.id_user === room.id_seller) {
                await pool.query(
                    `UPDATE chat_room SET unread_count_seller = 0 WHERE id_room = $1`,
                    [room_id]
                );
            }
        }
        
        res.json({ success: true, messages: result.rows.reverse() });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Send message
const sendMessage = async (req, res) => {
    const { room_id, message, image } = req.body;
    const sender_id = req.user.id_user;
    
    try {
        const roomResult = await pool.query(
            `SELECT * FROM chat_room WHERE id_room = $1`,
            [room_id]
        );
        
        if (roomResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Room tidak ditemukan' });
        }
        
        const room = roomResult.rows[0];
        const receiver_id = sender_id === room.id_user ? room.id_seller : room.id_user;
        
        const messageResult = await pool.query(
            `INSERT INTO chat_message (id_room, id_sender, message, image)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [room_id, sender_id, message, image]
        );
        
        // Update last message in room
        await pool.query(
            `UPDATE chat_room 
             SET last_message = $1, 
                 last_message_time = CURRENT_TIMESTAMP,
                 unread_count_${receiver_id === room.id_user ? 'user' : 'seller'} = 
                     unread_count_${receiver_id === room.id_user ? 'user' : 'seller'} + 1
             WHERE id_room = $2`,
            [message || 'Gambar', room_id]
        );
        
        const newMessage = messageResult.rows[0];
        
        // Emit via socket.io jika io tersedia
        if (io) {
            io.to(`room_${room_id}`).emit('new-message', {
                ...newMessage,
                sender_name: req.user.name,
                sender_avatar: req.user.avatar
            });
        }
        
        res.json({ success: true, message: newMessage });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

module.exports = { getOrCreateRoom, getUserRooms, getMessages, sendMessage, setIo };