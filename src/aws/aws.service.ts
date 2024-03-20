import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsService {
  s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_S3_SECRET_KEY'),
      },
    });
  }

  async imageUploadToS3(
    fileName: string,
    file: Express.Multer.File,
    ext: string,
  ) {
    //AWS S3에 이미지 업로드 실행
    const command = new PutObjectCommand({
      Bucket: this.configService.get('AWS_S3_BUCKET_NAME'), // 버켓 이름
      Key: fileName, // 업로드 될 파일의 이름
      Body: file.buffer, // 업로드할 파일
      ACL: 'public-read', // 파일 접근 권한
      ContentType: `image/${ext}`, //파일 타입
    });
    // 명령을 S3에 전달
    try {
      await this.s3Client.send(command);
    } catch {
      throw new InternalServerErrorException(
        '이미지 저장 중 오류가 발생했습니다.',
      );
    }

    return `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_S3_BUCKET_NAME}/${fileName}`;
  }
}
