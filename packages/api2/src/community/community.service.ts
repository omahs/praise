import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ServiceException } from '@/shared/exceptions/service-exception';
import { Community, CommunityModel } from './schemas/community.schema';
import { PaginatedQueryDto } from '@/shared/dto/pagination-query.dto';
import { CommunityPaginatedResponseDto } from './dto/community-pagination-model.dto';
import { CreateCommunityInputDto } from './dto/create-community-input.dto';
import { UpdateCommunityInputDto } from './dto/update-community-input.dto';
import { LinkDiscordBotDto } from './dto/link-discord-bot.dto';
import { ethers } from 'ethers';
import { DiscordLinkState } from './enums/discord-link-state';
import { errorMessages } from '@/utils/errorMessages';
import { randomBytes } from 'crypto';
import { assertOwnersIncludeCreator } from './utils/assert-owners-include-creator';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(Community.name, 'praise')
    private communityModel: typeof CommunityModel,
  ) {}

  /**
   * Convenience method to get the Community Model
   * @returns
   */
  getModel(): typeof CommunityModel {
    return this.communityModel;
  }

  async findOne(query: any): Promise<Community> {
    return this.communityModel.findOne(query).lean();
  }

  async findOneById(_id: Types.ObjectId): Promise<Community> {
    return this.findOne({ _id });
  }

  /**
   * Find all communities. Paginated.
   * @param options
   * @returns
   */
  async findAllPaginated(
    options: PaginatedQueryDto,
  ): Promise<CommunityPaginatedResponseDto> {
    const { page, limit, sortColumn, sortType } = options;
    const query = {} as any;

    // Sorting - defaults to descending
    const sort =
      sortColumn && sortType ? { [sortColumn]: sortType } : undefined;

    const paginateQuery = {
      query,
      limit,
      page,
      sort,
    };

    const communityPagination = await this.communityModel.paginate(
      paginateQuery,
    );
    if (!communityPagination)
      throw new ServiceException(errorMessages.FAILED_TO_QUERY_COMMUNITIES);

    return communityPagination;
  }

  async update(
    _id: Types.ObjectId,
    community: UpdateCommunityInputDto,
  ): Promise<Community> {
    const communityDocument = await this.communityModel.findById(_id);
    if (!communityDocument)
      throw new ServiceException(errorMessages.communityNotFound);
    if (community.owners) {
      assertOwnersIncludeCreator(community.owners, communityDocument.creator);
    }

    for (const [k, v] of Object.entries(community)) {
      communityDocument.set(k, v);
    }

    await communityDocument.save();
    return this.findOneById(communityDocument._id);
  }

  async create(communityDto: CreateCommunityInputDto): Promise<Community> {
    assertOwnersIncludeCreator(communityDto.owners, communityDto.creator);
    const community = new this.communityModel({
      ...communityDto,
      isPublic: true,
      // it produces a random string of 5 characters
      discordLinkNonce: randomBytes(5).toString('hex'),
    });
    await community.save();
    return community.toObject();
  }

  async linkDiscord(
    communityId: Types.ObjectId,
    linkDiscordBotDto: LinkDiscordBotDto,
  ): Promise<Community> {
    const community = await this.getModel().findById(communityId);
    if (!community) throw new ServiceException(errorMessages.communityNotFound);
    if (community.discordLinkState === DiscordLinkState.ACTIVE)
      throw new ServiceException(errorMessages.COMMUNITY_IS_ALREADY_ACTIVE);

    // Generate message to be signed
    const generatedMsg = this.generateLinkDiscordMessage({
      nonce: community.discordLinkNonce as string,
      guildId: community.discordGuildId as string,
      communityId: String(communityId),
    });

    // Verify signature against generated message
    // Recover signer and compare against community creator address
    const signerAddress = ethers.utils.verifyMessage(
      generatedMsg,
      linkDiscordBotDto.signedMessage,
    );
    if (signerAddress?.toLowerCase() !== community.creator.toLowerCase()) {
      throw new ServiceException(errorMessages.VERIFICATION_FAILED);
    }

    community.discordLinkState = DiscordLinkState.ACTIVE;
    await community.save();
    return community;
  }

  /**
   * Generate a link discord message that will be signed by the frontend user, and validated by the api
   */
  generateLinkDiscordMessage = (params: {
    nonce: string;
    communityId: string;
    guildId: string;
  }): string => {
    return (
      'SIGN THIS MESSAGE TO LINK THE PRAISE DISCORD BOT TO YOUR COMMUNITY.\n\n' +
      `DISCORD GUILD ID:\n${params.guildId}\n\n` +
      `PRAISE COMMUNITY ID:\n${params.communityId}\n\n` +
      `NONCE:\n${params.nonce}`
    );
  };
}
