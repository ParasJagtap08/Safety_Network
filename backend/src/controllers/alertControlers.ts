import prisma from "../db/prisma";
import { Request, Response } from "express";
import { randomUUID } from "crypto";

// ---------------- CREATE ALERT ----------------
const createNewAlert = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: (req as any).user.id,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const alert = await prisma.alert.create({
      data: {
        userId: user.id,
        accessCode: randomUUID(),
      },
    });

    return res.status(200).json({
      message: "New alert created successfully",
      alert,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ---------------- SEND IMAGE ----------------
const sendImage = async (req: Request, res: Response) => {
  try {
    const { alertid, image } = req.body;

    const data = await prisma.image.create({
      data: {
        base64: image,
        alertId: alertid,
      },
    });

    return res.status(200).json({
      message: "Image added successfully",
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ---------------- SEND AUDIO ----------------
const sendAudio = async (req: Request, res: Response) => {
  try {
    const { alertid, audio } = req.body;

    const data = await prisma.audio.create({
      data: {
        base64: audio,
        alertId: alertid,
      },
    });

    return res.status(200).json({
      message: "Audio added successfully",
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ---------------- SEND LOCATION ----------------
const sendLocation = async (req: Request, res: Response) => {
  try {
    const { alertid, latitude, longitude } = req.body;

    const resp = await prisma.location.create({
      data: {
        latitude,
        longitude,
        alertId: alertid,
        isalert: true,
        userId: (req as any).user.id,
      },
    });

    return res.status(200).json({
      message: "Location added successfully",
      data: resp,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ---------------- GET ALERT INFO ----------------
const allAlertInfo = async (req: any, res: any) => {
  try {
    const { accessCode } = req.params;
    const page = req.query.page;

    const alert = await prisma.alert.findFirst({
      where: {
        accessCode: accessCode,
      },
      include: {
        audio: {
          orderBy: { createdAt: "desc" },
          take: 5,
          skip: page ? parseInt(page) * 5 : 0,
        },
        image: {
          orderBy: { createdAt: "desc" },
          take: 5,
          skip: page ? parseInt(page) * 5 : 0,
        },
        location: {
          orderBy: { createdAt: "desc" },
          take: 50,
          skip: page ? parseInt(page) * 50 : 0,
        },
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    return res.status(200).json({
      message: "Alert found successfully",
      alert,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ---------------- 🚨 NEW SOS API ----------------
const sendSOS = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = (req as any).user?.id;

    if (!userId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "User, latitude and longitude are required",
      });
    }

    console.log("🚨 SOS triggered");

    // 1️⃣ Create alert
    const alert = await prisma.alert.create({
      data: {
        userId: userId,
        accessCode: randomUUID(),
      },
    });

    // 2️⃣ Save location
    await prisma.location.create({
      data: {
        latitude,
        longitude,
        alertId: alert.id,
        isalert: true,
        userId: userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "SOS triggered successfully",
      alertId: alert.id,
      accessCode: alert.accessCode,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ---------------- EXPORT ----------------
export {
  createNewAlert,
  sendAudio,
  sendImage,
  sendLocation,
  allAlertInfo,
  sendSOS,
};