// Error Handling Classes
class BadRequestError extends Error {
    constructor(errMessage) {
        super(errMessage);
        this.name = "BadRequestError";
        this.code = 400;
    }
}

class NotFoundError extends BadRequestError {
    constructor(errMessage) {
        super(errMessage);
        this.name = "NotFoundError";
        this.code = 404;
    }
}

class MissingIdError extends BadRequestError {
    constructor(errMessage) {
        super(errMessage);
        this.name = "MissingIdError";
        this.code = 404;
    }
}

class DbError extends BadRequestError {
    constructor(errMessage) {
        super(errMessage);
        this.name = "DatabaseError";
        this.code = 400;
    }
}

class InvalidRouteError extends BadRequestError {
    constructor(errMessage) {
        super(errMessage);
        this.name = "InvalidRouteError";
        this.code = 404;
    }
}

class InvalidCredentialsError extends BadRequestError {
    constructor(errMessage) {
        super(errMessage);
        this.name = "InvalidCredentialsError";
        this.code = 403;
    }
}

module.exports = { BadRequestError, DbError, MissingIdError, NotFoundError, InvalidRouteError, InvalidCredentialsError }