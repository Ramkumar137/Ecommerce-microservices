import os
import uuid
import boto3


_s3_client = None


def get_s3_client():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client(
            "s3",
            region_name=os.getenv("AWS_REGION", "us-east-1"),
        )
    return _s3_client


class _S3ClientProxy:
    def upload_fileobj(self, *args, **kwargs):
        return get_s3_client().upload_fileobj(*args, **kwargs)


s3_client = _S3ClientProxy()



def upload_product_image(file):
    """
    Upload image to S3 and return its public URL.
    """

    extension = file.name.split(".")[-1]

    filename = f"products/{uuid.uuid4().hex}.{extension}"

    bucket = os.getenv("S3_BUCKET_NAME")

    s3_client.upload_fileobj(
        file,
        bucket,
        filename,
        ExtraArgs={
            "ContentType": file.content_type,
        },
    )

    return (
        f"https://{bucket}.s3."
        f"{os.getenv('AWS_REGION')}.amazonaws.com/"
        f"{filename}"
    )