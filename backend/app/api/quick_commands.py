from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select

from app.api.dependencies import get_current_user, get_db
from app.models.quick_command import QuickCommand
from app.models.user import User
from app.schemas.api import (
    QuickCommandCreateRequest,
    QuickCommandResponse,
    QuickCommandUpdateRequest,
)


router = APIRouter(prefix="/quick-commands", tags=["quick-commands"])


@router.get("", response_model=list[QuickCommandResponse])
def list_quick_commands(
    user: User = Depends(get_current_user),
    db=Depends(get_db),
) -> list[QuickCommandResponse]:
    commands = (
        db.execute(
            select(QuickCommand)
            .where(QuickCommand.user_id == user.id)
            .order_by(QuickCommand.group_name, QuickCommand.sort_order, QuickCommand.id)
        )
        .scalars()
        .all()
    )
    return [
        QuickCommandResponse(
            id=cmd.id,
            name=cmd.name,
            group_name=cmd.group_name,
            command=cmd.command,
            sort_order=cmd.sort_order,
        )
        for cmd in commands
    ]


@router.post("", response_model=QuickCommandResponse)
def create_quick_command(
    payload: QuickCommandCreateRequest,
    user: User = Depends(get_current_user),
    db=Depends(get_db),
) -> QuickCommandResponse:
    max_order = db.execute(
        select(QuickCommand.sort_order)
        .where(QuickCommand.user_id == user.id)
        .order_by(QuickCommand.sort_order.desc())
        .limit(1)
    ).scalar()

    command = QuickCommand(
        user_id=user.id,
        name=payload.name,
        group_name=payload.group_name,
        command=payload.command,
        sort_order=(max_order or 0) + 1,
    )
    db.add(command)
    db.flush()

    return QuickCommandResponse(
        id=command.id,
        name=command.name,
        group_name=command.group_name,
        command=command.command,
        sort_order=command.sort_order,
    )


@router.put("/{command_id}", response_model=QuickCommandResponse)
def update_quick_command(
    command_id: int,
    payload: QuickCommandUpdateRequest,
    user: User = Depends(get_current_user),
    db=Depends(get_db),
) -> QuickCommandResponse:
    command = db.execute(
        select(QuickCommand).where(
            QuickCommand.id == command_id, QuickCommand.user_id == user.id
        )
    ).scalar_one_or_none()
    if not command:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Quick command not found"
        )

    if payload.name is not None:
        command.name = payload.name
    if payload.group_name is not None:
        command.group_name = payload.group_name
    if payload.command is not None:
        command.command = payload.command
    if payload.sort_order is not None:
        command.sort_order = payload.sort_order

    db.flush()

    return QuickCommandResponse(
        id=command.id,
        name=command.name,
        group_name=command.group_name,
        command=command.command,
        sort_order=command.sort_order,
    )


@router.delete("/{command_id}")
def delete_quick_command(
    command_id: int,
    user: User = Depends(get_current_user),
    db=Depends(get_db),
) -> dict:
    command = db.execute(
        select(QuickCommand).where(
            QuickCommand.id == command_id, QuickCommand.user_id == user.id
        )
    ).scalar_one_or_none()
    if not command:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Quick command not found"
        )

    db.delete(command)
    return {"status": "ok"}
