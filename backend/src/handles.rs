                StatusCode::BAD_REQUEST,
            ));
        }

        match self.database.add_fee(request).await {
            Ok(()) => Ok(with_status("Success", StatusCode::OK)),
            Err(DatabaseError::NoRowsAltered) => Ok(with_status(
                "Invalid apartment id list supplied",
                StatusCode::NOT_FOUND,
            )),
            Err(error) => Err(error.into()),
        }
    }

    /// DELETE /api/delete/fee/{fee_type_id}
    /// Deletes fee records belonging to the specified fee type.
    pub async fn delete_fee_handle(
        self,
        privilege: PrivilegeLevel,
        fee_type_id: FeeTypeId,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Admin {
            Err(UnderAuthenticated)?;
        }

        let fee_types = self.database.get_all_fee_types().await?;
        if !fee_types.iter().any(|fee_type| fee_type.id == fee_type_id) {
            return Ok(with_status(
                html("Fee type id doesn't exist"),
                StatusCode::NOT_FOUND,
            ));
        }

        self.database.delete_fees(fee_type_id).await?;
        Ok(with_status(html("Delete OK"), StatusCode::OK))
    }

    /// POST /api/edit/fee
    /// Modifies fee records selected by fee type and apartment.
    pub async fn edit_fee_handle(
        self,
        privilege: PrivilegeLevel,
        request: FeeModificationRequest,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Admin {
            Err(UnderAuthenticated)?;
        }

        if let Some(amount) = request.amount
            && amount <= 0
        {
            return Ok(with_status(
                "Invalid amount",
                StatusCode::BAD_REQUEST,
            ));
        }

        if self.database.modify_fee(request).await? == 0 {
            return Ok(with_status(
                "No records altered",
                StatusCode::NOT_FOUND,
            ));
        }

        Ok(with_status("Modify OK", StatusCode::OK))
    }

    /// GET /api/apartments/{floor}
    /// Returns apartments on the requested floor.
    pub async fn get_apartments_handle(
        self,
        privilege: PrivilegeLevel,
        floor: i32,
    ) -> Result<impl Reply, Rejection> {
        const FLOOR_LIMIT: i32 = 30;

        if privilege < PrivilegeLevel::Accountant {
            Err(UnderAuthenticated)?;
        }

        if !(0..=FLOOR_LIMIT).contains(&floor) {
            return Ok(with_status(
                json(&json!({ "error": "Invalid floor" })),
                StatusCode::BAD_REQUEST,
            ));
        }

        let apartments = self.database.get_apartments(floor).await?;
        Ok(with_status(
            json(&json!({ "apartments": apartments })),
            StatusCode::OK,
        ))
    }

    /// GET /api/fee/apartment/{apartment_id}
    /// Returns fee records for the requested apartment.
    pub async fn get_apartment_fees_handle(
        self,
        privilege: PrivilegeLevel,
        apartment_id: ApartmentId,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Accountant {
            Err(UnderAuthenticated)?;
        }

        let fees = self.database.get_apartment_fees(apartment_id).await?;
        Ok(with_status(
            json(&json!({ "fees": fees })),
            StatusCode::OK,
        ))
    }
}
