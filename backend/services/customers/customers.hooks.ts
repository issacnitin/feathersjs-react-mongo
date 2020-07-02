import express from "@feathersjs/express";
import { HookContext, Hook } from '@feathersjs/feathers';
import { Customer } from "./customers.model";

export function customersHooks(app: express.Application) {
    app.service('customers').hooks({
        before: {
            create: [
                async (context: HookContext) => {
                    let cx = new Customer(context.data);
                    cx.created = new Date();
                    context.params.data = cx;
                }
            ],
            get: [
                async (context: HookContext) => {
                    let query = {
                        query: {
                            customer: context.id,
                            $select: [ '_id' ]
                        }
                    };

                    let orders = await (app.service('orders')).find(query);
                    orders = orders.map((order: any) => {
                        return order._id;
                    })

                    context.params = {
                        data: orders
                    };
                }
            ],
            patch: [
                async (context: HookContext) => {
                    let cx = new Customer(context.data);
                    delete context.data.created;
                    context.data = cx;
                }
            ],
            remove: [
                async (context: HookContext) => {
                    let param = {
                        query: {
                            customerId: context.id
                        }
                    };
                    await app.service('orders').remove(null, param);
                }
            ]
        }
    })
}