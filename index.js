const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

const dbUrl = "mongodb+srv://root:123@atlascluster.ndbn3qj.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster";

mongoose.connect(dbUrl)
    .then(() => {
        console.info("Connected to the database");
    })
    .catch((e) => {
        console.error("Error:", e);
    });


const userSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    phone: String,
    password: String,
});

const User = mongoose.model('User', userSchema);

const PORT = 3003;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.post("/sign_up", async (req, res) => {
    try {
        const { fname, lname, email, phone, password, rpassword } = req.body;


        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fname,
            lname,
            email,
            phone,
            password: hashedPassword,
        });

        await newUser.save();
        console.log("Record Inserted Successfully");

        return res.redirect('signup_success.html');
    } catch (err) {
        console.error("Error inserting record: ", err);
        return res.status(500).send("Internal Server Error");
    }
});

app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin": '*'
    });
    return res.redirect('index.html');
});

app.get("/read", async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).send(users);
    } catch (err) {
        console.error("Error reading records: ", err);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/display", async (req, res) => {
    try {
        const users = await User.find();
        let userHtml = '<h1>Danh sách người dùng</h1>';
        userHtml += '<ul>';
        users.forEach(user => {
            userHtml += `<li>${user.fname} ${user.lname} - ${user.email} - ${user.phone}</li>`;
        });
        userHtml += '</ul>';
        res.send(userHtml);
    } catch (err) {
        console.error("Error displaying users: ", err);
        res.status(500).send("Internal Server Error");
    }
});



app.get("/delete_user", (req, res) => {
    res.sendFile(__dirname + '/public/delete_user.html');
});


app.delete("/delete/:id", async (req, res) => {
    try {
        const userId = req.params.id;
    
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).send("Không tìm thấy người dùng");
        }

        console.log("Xóa thành công");
        res.status(200).send("Xóa thành công");
    } catch (err) {
        console.error("Lỗi khi xóa: ", err);
        res.status(500).send("Lỗi máy chủ nội bộ");
    }
});


app.get('/update_info', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/update_info.html'));
});

app.post("/update/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const { fname, lname, email, phone, password } = req.body;

        let updateData = { fname, lname, email, phone };

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).send("Không tìm thấy người dùng");
        }

        console.log("Cập nhật thành công");
        res.status(200).send(updatedUser);
    } catch (err) {
        console.error("Lỗi khi cập nhật: ", err);
        res.status(500).send("Lỗi máy chủ nội bộ");
    }
});



app.post("/update", async (req, res) => {
    try {
        const userId = req.body.userId; 
        const { fname, lname, email, phone, password } = req.body;

        let updateData = { fname, lname, email, phone };

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).send("Không tìm thấy người dùng");
        }

        console.log("Cập nhật thành công");
        res.status(200).send(updatedUser);
    } catch (err) {
        console.error("Lỗi khi cập nhật: ", err);
        res.status(500).send("Lỗi máy chủ nội bộ");
    }
});
