module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "db",
    ()=>db
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
const db = globalForPrisma.prisma || new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]();
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = db;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/app/api/follow-up/records/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
;
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId') || '';
        const status = searchParams.get('status') || '';
        const search = searchParams.get('search') || '';
        const where = {};
        if (patientId) where.patientId = patientId;
        if (status) where.status = status;
        if (search) {
            where.OR = [
                {
                    condition: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    diagnosis: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    patient: {
                        name: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                },
                {
                    patient: {
                        phone: {
                            contains: search
                        }
                    }
                },
                {
                    patient: {
                        fileNumber: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            ];
        }
        const records = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].followUpRecord.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        fileNumber: true,
                        phone: true,
                        age: true,
                        gender: true
                    }
                },
                followUpVisits: {
                    orderBy: {
                        visitNumber: 'desc'
                    }
                }
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            records
        });
    } catch (error) {
        console.error('Get follow-up records error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        if (!body.patientId || !body.condition) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'patientId and condition are required'
            }, {
                status: 400
            });
        }
        const data = {
            patientId: body.patientId,
            condition: body.condition,
            conditionCategory: body.conditionCategory || null,
            severity: body.severity || 'moderate',
            status: body.status || 'active',
            frequency: body.frequency || 'monthly',
            customDays: body.customDays || null,
            nextVisitDate: body.nextVisitDate ? new Date(body.nextVisitDate) : null,
            lastVisitDate: body.lastVisitDate ? new Date(body.lastVisitDate) : null,
            hasSubscription: body.hasSubscription || false,
            subscriptionType: body.subscriptionType || null,
            subscriptionPrice: body.subscriptionPrice || 0,
            subscriptionStart: body.subscriptionStart ? new Date(body.subscriptionStart) : null,
            subscriptionEnd: body.subscriptionEnd ? new Date(body.subscriptionEnd) : null,
            sessionsIncluded: body.sessionsIncluded || 0,
            sessionsUsed: 0,
            diagnosis: body.diagnosis || null,
            treatmentPlan: body.treatmentPlan || null,
            medications: body.medications || null,
            notes: body.notes || null,
            reminderEnabled: body.reminderEnabled !== false,
            reminderDaysBefore: body.reminderDaysBefore || 1
        };
        const record = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].followUpRecord.create({
            data: data,
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        fileNumber: true,
                        phone: true
                    }
                },
                followUpVisits: true
            }
        });
        // If subscription has a price, create a financial transaction
        if (body.hasSubscription && body.subscriptionPrice > 0) {
            try {
                const patientName = record.patient?.name || 'مريض';
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].transaction.create({
                    data: {
                        type: 'income',
                        category: 'متابعة',
                        amount: body.subscriptionPrice,
                        description: `باقة متابعة - ${patientName} - ${body.condition}`,
                        date: new Date()
                    }
                });
            } catch (e) {
                console.error('Failed to create subscription transaction:', e);
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            record
        }, {
            status: 201
        });
    } catch (error) {
        console.error('Create follow-up record error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b149fabb._.js.map