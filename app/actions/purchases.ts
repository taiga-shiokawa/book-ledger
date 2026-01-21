"use server";

import { prisma } from "../lib/prisma";
import { getUserIdFromAccessToken } from "../lib/auth";

const TITLE_MIN = 1;
const TITLE_MAX = 200;
const PRICE_MIN = 0;
const PRICE_MAX = 9_999_999;

function parsePrice(value: FormDataEntryValue | null) {
  const price = Number(value);
  if (!Number.isInteger(price)) {
    return null;
  }
  return price;
}

function parsePurchasedAt(value: FormDataEntryValue | null) {
  if (!value) {
    return new Date();
  }
  const date = new Date(value.toString());
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

async function getUserIdFromForm(formData: FormData) {
  const accessToken = formData.get("accessToken");
  if (!accessToken || typeof accessToken !== "string") {
    throw new Error("Unauthorized");
  }
  return getUserIdFromAccessToken(accessToken);
}

export async function createPurchaseAction(formData: FormData) {
  const userId = await getUserIdFromForm(formData);
  const title = formData.get("title");
  const priceValue = formData.get("price");
  const purchasedAtValue = formData.get("purchasedAt");

  const trimmedTitle = typeof title === "string" ? title.trim() : "";
  if (trimmedTitle.length < TITLE_MIN || trimmedTitle.length > TITLE_MAX) {
    throw new Error("Title must be 1-200 characters.");
  }

  const price = parsePrice(priceValue);
  if (price === null || price < PRICE_MIN || price > PRICE_MAX) {
    throw new Error("Price must be an integer between 0 and 9,999,999.");
  }

  const purchasedAt = parsePurchasedAt(purchasedAtValue);
  if (!purchasedAt) {
    throw new Error("Purchased date is invalid.");
  }

  const created = await prisma.purchase.create({
    data: {
      userId,
      title: trimmedTitle,
      price,
      purchasedAt,
    },
  });

  return { id: created.id };
}

export async function updatePurchaseAction(formData: FormData) {
  const userId = await getUserIdFromForm(formData);
  const id = formData.get("id");
  const title = formData.get("title");
  const priceValue = formData.get("price");
  const purchasedAtValue = formData.get("purchasedAt");

  if (!id || typeof id !== "string") {
    throw new Error("Missing purchase id.");
  }

  const trimmedTitle = typeof title === "string" ? title.trim() : "";
  if (trimmedTitle.length < TITLE_MIN || trimmedTitle.length > TITLE_MAX) {
    throw new Error("Title must be 1-200 characters.");
  }

  const price = parsePrice(priceValue);
  if (price === null || price < PRICE_MIN || price > PRICE_MAX) {
    throw new Error("Price must be an integer between 0 and 9,999,999.");
  }

  const purchasedAt = parsePurchasedAt(purchasedAtValue);
  if (!purchasedAt) {
    throw new Error("Purchased date is invalid.");
  }

  const result = await prisma.purchase.updateMany({
    where: { id, userId },
    data: {
      title: trimmedTitle,
      price,
      purchasedAt,
    },
  });

  if (result.count === 0) {
    throw new Error("Purchase not found.");
  }

  return { id };
}

export async function deletePurchaseAction(formData: FormData) {
  const userId = await getUserIdFromForm(formData);
  const id = formData.get("id");

  if (!id || typeof id !== "string") {
    throw new Error("Missing purchase id.");
  }

  const result = await prisma.purchase.deleteMany({
    where: { id, userId },
  });

  if (result.count === 0) {
    throw new Error("Purchase not found.");
  }

  return { id };
}
