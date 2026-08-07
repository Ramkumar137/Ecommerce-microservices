import os
import pytest
from unittest.mock import MagicMock
from utils.dynamodb import get_dynamodb_resource, get_table, dynamodb
from utils.s3 import upload_product_image, get_s3_client, s3_client


def test_product_dynamodb_utils(mocker):
    mock_resource = mocker.patch("utils.dynamodb.boto3.resource")
    get_dynamodb_resource()
    assert mock_resource.called

    tbl = get_table("test-products")
    assert tbl is not None

    tbl2 = dynamodb.Table("test-products-2")
    assert tbl2 is not None


def test_upload_product_image_success(mocker):
    mock_client = mocker.MagicMock()
    mocker.patch("utils.s3.get_s3_client", return_value=mock_client)

    file_mock = MagicMock()
    file_mock.name = "laptop.png"
    file_mock.content_type = "image/png"

    url = upload_product_image(file_mock)
    assert "https://" in url
    assert "laptop" in url or ".png" in url
    assert mock_client.upload_fileobj.called


def test_s3_client_proxy(mocker):
    mock_client = mocker.MagicMock()
    mocker.patch("utils.s3.get_s3_client", return_value=mock_client)
    s3_client.upload_fileobj(None, "bucket", "file")
    assert mock_client.upload_fileobj.called
