from fastapi import APIRouter, Depends, HTTPException, status


router = APIRouter(prefix="/servers/{server_id}/containers", tags=["containers"])