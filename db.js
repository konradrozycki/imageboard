// psql caper-imageboard -f sql/images.sql

const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/caper-imageboard"
);
module.exports.getImages = () => {
    let q = `SELECT * FROM images ORDER BY images.id DESC LIMIT 9`;
    return db.query(q);
};

exports.getMoreImages = (lastId) =>
    db.query(
        `SELECT url, title, id, (
     SELECT id FROM images
     ORDER BY id ASC
     LIMIT 1
     ) AS "lowestId" FROM images
     WHERE id < $1
     ORDER BY id DESC
     LIMIT 9;`,
        [lastId]
    );

module.exports.addImage = (url, username, title, description) => {
    let q =
        "INSERT INTO images (url, username, title, description) VALUES ($1, $2, $3, $4) RETURNING *";
    let params = [url, username, title, description];
    return db.query(q, params);
};

module.exports.getImage = (id) => {
    return db.query(`SELECT * FROM images WHERE id = $1`, [id]);
};

module.exports.addComment = (comment, username, image_id) => {
    let q =
        "INSERT INTO comments (comment, username, image_id) VALUES ($1, $2, $3) RETURNING comment, username";
    let params = [comment, username, image_id];
    return db.query(q, params);
};

module.exports.getComments = (image_id) => {
    let q = "SELECT * FROM comments WHERE image_id = $1";
    let params = [image_id];
    return db.query(q, params);
};
