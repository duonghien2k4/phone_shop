export declare const appConfig: () => {
    port: number;
    nodeEnv: string;
    database: {
        url: string;
    };
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessExpiresIn: string;
        refreshExpiresIn: string;
    };
    clerk: {
        secretKey: string;
        jwtKey: string;
    };
    redis: {
        host: string;
        port: number;
        password: string;
    };
    cloudinary: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    };
    openai: {
        apiKey: string;
        model: string;
        embeddingModel: string;
    };
    emailjs: {
        serviceId: string;
        templateId: string;
        confirmTemplateId: string;
        publicKey: string;
        privateKey: string;
    };
    frontendUrl: string;
    cors: {
        allowedOrigins: string;
    };
};
