export declare class AppService {
    getHello(): string;
    getHealth(): {
        status: string;
        app: string;
        environment: string;
        timestamp: string;
    };
}
